#!/usr/bin/env python3
"""
Smart Color MVP API (SQL-only for now).

HEX-first matching API to validate plugin behavior quickly.
"""

import os
import sqlite3
import time
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from urllib import error as urlerror
from urllib import request as urlrequest
import json

from flask import Flask, jsonify, request, make_response
import numpy as np
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie2000
from PIL import Image
from sklearn.cluster import KMeans

from build_db_from_json import build_database, DEFAULT_DB_PATH, DEFAULT_JSON_PATH


DB_PATH = os.environ.get("SMARTCOLOR_MVP_DB_PATH", DEFAULT_DB_PATH)
JSON_PATH = os.environ.get("SMARTCOLOR_MVP_JSON_PATH", DEFAULT_JSON_PATH)
XANO_BASE_URL = os.environ.get("XANO_BASE_URL", "").strip().rstrip("/")
XANO_API_KEY = os.environ.get("XANO_API_KEY", "").strip()
CATALOG_SOURCE = os.environ.get("SMARTCOLOR_CATALOG_SOURCE", "xano").strip().lower()
CATALOG_CACHE_TTL_SECONDS = int(os.environ.get("SMARTCOLOR_CATALOG_CACHE_TTL_SECONDS", "60"))

app = Flask(__name__)

_catalog_cache = {
    "expires_at": 0.0,
    "colors": [],
    "source": None,
}

# Fix for colormath + newer numpy compatibility
if not hasattr(np, "asscalar"):
    def asscalar(a):
        return np.asarray(a).item()
    np.asscalar = asscalar


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response


@dataclass
class Lab:
    l: float
    a: float
    b: float


def ensure_database():
    db = Path(DB_PATH)
    if db.exists():
        return
    build_database(JSON_PATH, DB_PATH)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def normalize_hex(value: str) -> str:
    value = value.strip().lower().replace("#", "")
    if len(value) != 6 or any(c not in "0123456789abcdef" for c in value):
        raise ValueError("Invalid HEX format. Use #RRGGBB or RRGGBB.")
    return value


def hex_to_rgb(value: str):
    value = normalize_hex(value)
    return (
        int(value[0:2], 16) / 255.0,
        int(value[2:4], 16) / 255.0,
        int(value[4:6], 16) / 255.0,
    )


def hex_to_lab(hex_value: str) -> Lab:
    r, g, b = hex_to_rgb(hex_value)
    rgb = sRGBColor(r, g, b)
    lab = convert_color(rgb, LabColor, target_illuminant="d65")
    return Lab(l=lab.lab_l, a=lab.lab_a, b=lab.lab_b)


def delta_e_cie2000_from_lab(l1: Lab, l2: Lab) -> float:
    lab1 = LabColor(l1.l, l1.a, l1.b)
    lab2 = LabColor(l2.l, l2.a, l2.b)
    return float(delta_e_cie2000(lab1, lab2))


def _xano_headers():
    headers = {
        "Accept": "application/json",
    }
    if XANO_API_KEY:
        headers["Authorization"] = f"Bearer {XANO_API_KEY}"
    return headers


def _extract_image_url(value):
    if isinstance(value, dict):
        url = value.get("url")
        if isinstance(url, str) and url.strip():
            return url.strip()
        path = value.get("path")
        if isinstance(path, str) and path.strip():
            return path.strip()
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _normalize_catalog_row(raw):
    if not isinstance(raw, dict):
        return None
    code = (raw.get("code") or "").strip()
    name = (raw.get("name") or "").strip()
    hex_value = raw.get("hex_code") or raw.get("extracted_hex") or ""
    try:
        normalized_hex = normalize_hex(str(hex_value))
    except ValueError:
        return None
    return {
        "code": code or "UNKNOWN",
        "name": name or "",
        "hex": normalized_hex,
        "swatch_url": _extract_image_url(raw.get("swatch_img")),
    }


def fetch_colors_from_xano():
    if not XANO_BASE_URL:
        raise RuntimeError("XANO_BASE_URL is required when SMARTCOLOR_CATALOG_SOURCE=xano.")

    url = f"{XANO_BASE_URL}/pantone_colors"
    req = urlrequest.Request(url, headers=_xano_headers(), method="GET")
    with urlrequest.urlopen(req, timeout=20) as resp:
        body = resp.read().decode("utf-8")
    payload = json.loads(body) if body else []

    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict):
        rows = payload.get("items") or payload.get("results") or payload.get("data") or []
    else:
        rows = []

    colors = []
    for row in rows:
        normalized = _normalize_catalog_row(row)
        if normalized:
            colors.append(normalized)
    return colors


def fetch_colors_from_sqlite():
    ensure_database()
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT code, name, extracted_hex
        FROM pantone_colors
        WHERE extracted_hex IS NOT NULL AND extracted_hex != ''
        """
    ).fetchall()
    conn.close()
    colors = []
    for row in rows:
        normalized = _normalize_catalog_row(
            {
                "code": row["code"],
                "name": row["name"],
                "extracted_hex": row["extracted_hex"],
            }
        )
        if normalized:
            colors.append(normalized)
    return colors


def get_catalog_colors():
    now = time.time()
    if _catalog_cache["colors"] and now < _catalog_cache["expires_at"]:
        return _catalog_cache["colors"], _catalog_cache["source"], None

    if CATALOG_SOURCE == "sqlite":
        colors = fetch_colors_from_sqlite()
        source = "sqlite"
        warn = None
    else:
        try:
            colors = fetch_colors_from_xano()
            source = "xano"
            warn = None
        except (RuntimeError, urlerror.URLError, json.JSONDecodeError, TimeoutError) as exc:
            # Safety fallback for local dev if Xano is unavailable.
            colors = fetch_colors_from_sqlite()
            source = "sqlite_fallback"
            warn = f"Xano unavailable, using sqlite fallback: {exc}"

    _catalog_cache["colors"] = colors
    _catalog_cache["source"] = source
    _catalog_cache["expires_at"] = now + max(1, CATALOG_CACHE_TTL_SECONDS)
    return colors, source, warn


def extract_dominant_hex_from_image(image_bytes: bytes, n_clusters: int = 3, fabric_mode: bool = False):
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        try:
            img = img.resize((100, 100), Image.Resampling.LANCZOS)
        except AttributeError:
            img = img.resize((100, 100), Image.LANCZOS)

        pixels = np.array(img).reshape(-1, 3)

        filtered_pixels = []
        for pixel in pixels:
            r, g, b = pixel
            if r > 240 and g > 240 and b > 240:
                continue
            if r < 10 and g < 10 and b < 10:
                continue
            filtered_pixels.append(pixel)

        if not filtered_pixels:
            filtered_pixels = pixels.tolist()

        filtered_pixels = np.array(filtered_pixels)
        if len(filtered_pixels) == 0:
            return None

        kmeans = KMeans(
            n_clusters=min(max(1, n_clusters), len(filtered_pixels)),
            random_state=42,
            n_init=10,
        )
        kmeans.fit(filtered_pixels)

        labels = kmeans.labels_
        unique_labels, counts = np.unique(labels, return_counts=True)
        dominant_cluster_idx = unique_labels[np.argmax(counts)]
        dominant = kmeans.cluster_centers_[dominant_cluster_idx]

        r = int(np.clip(dominant[0], 0, 255))
        g = int(np.clip(dominant[1], 0, 255))
        b = int(np.clip(dominant[2], 0, 255))

        if fabric_mode:
            rgb_norm = sRGBColor(r / 255.0, g / 255.0, b / 255.0)
            lab = convert_color(rgb_norm, LabColor, target_illuminant="d65")
            lab.lab_l = lab.lab_l * 0.88
            lab.lab_a = lab.lab_a * 0.98
            lab.lab_b = lab.lab_b * 0.98
            rgb_adjusted = convert_color(lab, sRGBColor, target_illuminant="d65")
            r = int(np.clip(rgb_adjusted.rgb_r * 255, 0, 255))
            g = int(np.clip(rgb_adjusted.rgb_g * 255, 0, 255))
            b = int(np.clip(rgb_adjusted.rgb_b * 255, 0, 255))

        return f"#{r:02x}{g:02x}{b:02x}"
    except Exception:
        return None


def compute_matches_from_input_lab(input_lab: Lab, limit: int):
    rows, source, warning = get_catalog_colors()

    matches = []
    for row in rows:
        try:
            row_lab = hex_to_lab(row["hex"])
        except ValueError:
            continue
        distance = delta_e_cie2000_from_lab(input_lab, row_lab)
        similarity = max(0.0, 100.0 - (distance * 5.0))
        matches.append(
            {
                "code": row["code"],
                "name": row["name"],
                "extracted_hex": f"#{row['hex']}",
                "swatch_url": row.get("swatch_url"),
                "delta_e": round(distance, 3),
                "similarity": round(similarity, 2),
            }
        )

    matches.sort(key=lambda x: x["delta_e"])
    return matches[:limit], len(matches), source, warning


@app.get("/api/health")
def health():
    colors, source, warning = get_catalog_colors()
    return jsonify(
        {
            "ok": True,
            "catalog_source": source,
            "catalog_rows": len(colors),
            "xano_base_url": XANO_BASE_URL or None,
            "warning": warning,
        }
    )


@app.route("/api/match", methods=["POST", "OPTIONS"])
def match_hex():
    if request.method == "OPTIONS":
        return make_response("", 204)

    payload = request.get_json(silent=True) or {}
    hex_input = payload.get("hex", "").strip()
    limit = int(payload.get("limit", 5))
    limit = max(1, min(limit, 20))

    if not hex_input:
        return jsonify({"error": "HEX is required"}), 400

    try:
        normalized = normalize_hex(hex_input)
        input_lab = hex_to_lab(normalized)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    top, total_compared, source, warning = compute_matches_from_input_lab(input_lab, limit)
    return jsonify(
        {
            "input_hex": f"#{normalized}",
            "metric": "cie2000",
            "catalog_source": source,
            "warning": warning,
            "total_compared": total_compared,
            "results": top,
        }
    )


@app.route("/api/match-image", methods=["POST", "OPTIONS"])
def match_image():
    if request.method == "OPTIONS":
        return make_response("", 204)

    if "image" not in request.files:
        return jsonify({"error": "Image file is required (field: image)."}), 400

    image_file = request.files["image"]
    if not image_file or image_file.filename == "":
        return jsonify({"error": "Image file is empty."}), 400

    try:
        limit = int(request.form.get("limit", 5))
        limit = max(1, min(limit, 20))
    except ValueError:
        return jsonify({"error": "Invalid limit."}), 400

    try:
        n_clusters = int(request.form.get("n_clusters", 3))
        n_clusters = max(1, min(n_clusters, 8))
    except ValueError:
        return jsonify({"error": "Invalid n_clusters."}), 400

    try:
        lightness_boost = float(request.form.get("lightness_boost", 1.05))
    except ValueError:
        return jsonify({"error": "Invalid lightness_boost."}), 400

    fabric_mode = str(request.form.get("fabric_mode", "true")).lower() == "true"

    image_bytes = image_file.read()
    extracted_hex = extract_dominant_hex_from_image(
        image_bytes=image_bytes,
        n_clusters=n_clusters,
        fabric_mode=fabric_mode,
    )
    if not extracted_hex:
        return jsonify({"error": "Could not extract dominant color from image."}), 400

    normalized = normalize_hex(extracted_hex)
    input_lab = hex_to_lab(normalized)
    if lightness_boost != 1.0:
        input_lab = Lab(
            l=min(100.0, input_lab.l * lightness_boost),
            a=input_lab.a,
            b=input_lab.b,
        )

    top, total_compared, source, warning = compute_matches_from_input_lab(input_lab, limit)
    return jsonify(
        {
            "input_hex": f"#{normalized}",
            "extracted_hex": f"#{normalized}",
            "metric": "cie2000",
            "mode": "image",
            "catalog_source": source,
            "warning": warning,
            "total_compared": total_compared,
            "params": {
                "n_clusters": n_clusters,
                "fabric_mode": fabric_mode,
                "lightness_boost": lightness_boost,
            },
            "results": top,
        }
    )


if __name__ == "__main__":
    print("Smart Color MVP API")
    print(f"Catalog source mode: {CATALOG_SOURCE}")
    if XANO_BASE_URL:
        print(f"Xano: {XANO_BASE_URL}")
    else:
        print(f"SQLite DB fallback: {DB_PATH}")
    print("Running on http://127.0.0.1:5050")
    app.run(host="127.0.0.1", port=5050, debug=True)

