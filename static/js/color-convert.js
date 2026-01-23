/**
 * Conversões de Espaços de Cor
 * RGB, HEX, LAB, CMYK
 */

// RGB para LAB (via XYZ)
function rgbToLab(r, g, b) {
    // Normaliza RGB para 0-1
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Converte para sRGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Converte para XYZ (usando matriz de conversão D65)
    let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
    let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100;
    let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100;

    // Normaliza XYZ para D65
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    // Converte para LAB
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b_val = 200 * (y - z);

    return {
        L: Math.round(L * 100) / 100,
        a: Math.round(a * 100) / 100,
        b: Math.round(b_val * 100) / 100
    };
}

// RGB para CMYK
function rgbToCmyk(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const k = 1 - Math.max(r, g, b);
    
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// RGB para HEX
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

// HEX para RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Formata LAB para string
function formatLab(lab) {
    return `L*${lab.L} a*${lab.a} b*${lab.b}`;
}

// Formata CMYK para string
function formatCmyk(cmyk) {
    return `C:${cmyk.c}% M:${cmyk.m}% Y:${cmyk.y}% K:${cmyk.k}%`;
}

