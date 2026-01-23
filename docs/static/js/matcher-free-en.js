/**
 * Smart Color Matcher - Free Version (no images)
 * Shows color previews and complete data
 */

let pantoneData = null;

const hexInput = document.getElementById('hexInput');
const colorPreview = document.getElementById('colorPreview');
const searchBtn = document.getElementById('searchBtn');
const useExtractedCheck = document.getElementById('useExtracted');
const resultsContainer = document.getElementById('results');
const resultsGrid = document.getElementById('resultsGrid');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Load data
window.addEventListener('DOMContentLoaded', async () => {
    loading.style.display = 'block';
    loading.querySelector('p').textContent = 'Loading data...';
    
    try {
        const response = await fetch('pantone_data.json');
        if (!response.ok) throw new Error('Error loading data');
        
        pantoneData = await response.json();
        console.log(`✅ ${pantoneData.length} colors loaded`);
        
        loading.style.display = 'none';
    } catch (error) {
        loading.style.display = 'none';
        showError(`Error loading data: ${error.message}`);
    }
});

hexInput.addEventListener('input', (e) => {
    let hex = e.target.value.trim();
    if (hex && !hex.startsWith('#')) {
        hex = '#' + hex;
        e.target.value = hex;
    }
    
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        colorPreview.style.backgroundColor = hex;
        colorPreview.style.display = 'block';
        searchBtn.disabled = false;
    } else {
        colorPreview.style.display = 'none';
        searchBtn.disabled = hex.length < 7;
    }
});

searchBtn.addEventListener('click', performSearch);
hexInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !searchBtn.disabled) {
        performSearch();
    }
});

async function performSearch() {
    const hex = hexInput.value.trim();
    
    if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
        showError('Please enter a valid HEX code (e.g., #bd2c27)');
        return;
    }
    
    if (!pantoneData) {
        showError('Data not loaded yet. Please wait...');
        return;
    }
    
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    searchBtn.disabled = true;
    
    setTimeout(() => {
        try {
            const results = findSimilarColors(hex, useExtractedCheck.checked, 5);
            displayResults({ input_hex: hex, results });
        } catch (error) {
            showError(`Error: ${error.message}`);
        } finally {
            loading.style.display = 'none';
            searchBtn.disabled = false;
        }
    }, 100);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToLab(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100 / 95.047;
    let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100 / 100.0;
    let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100 / 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b_val = 200 * (y - z);

    return { L, a: a, b: b_val };
}

function deltaE(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
}

function findSimilarColors(hexInput, useExtracted, limit) {
    const rgbInput = hexToRgb(hexInput);
    if (!rgbInput) return [];
    
    const labInput = rgbToLab(rgbInput.r, rgbInput.g, rgbInput.b);
    const matches = [];
    
    for (const color of pantoneData) {
        const hexColor = useExtracted ? (color.extracted_hex || color.visual_hex) : color.visual_hex;
        if (!hexColor) continue;
        
        const rgbColor = hexToRgb(hexColor);
        if (!rgbColor) continue;
        
        const labColor = rgbToLab(rgbColor.r, rgbColor.g, rgbColor.b);
        const deltaE_val = deltaE(labInput, labColor);
        const similarity = Math.max(0, 100 - (deltaE_val * 5));
        
        matches.push({
            ...color,
            hex: hexColor,
            delta_e: Math.round(deltaE_val * 100) / 100,
            similarity: Math.round(similarity * 10) / 10,
            rgb: rgbColor
        });
    }
    
    matches.sort((a, b) => a.delta_e - b.delta_e);
    return matches.slice(0, limit);
}

function displayResults(data) {
    resultsGrid.innerHTML = '';
    
    if (!data.results || data.results.length === 0) {
        showError('No similar colors found');
        return;
    }
    
    // Input color card
    const inputCard = document.createElement('div');
    inputCard.className = 'result-card';
    inputCard.style.border = '3px solid #667eea';
    inputCard.innerHTML = `
        <div class="result-header">
            <div>
                <div style="font-size: 1.1em; font-weight: bold; color: #333;">Client Color</div>
                <div style="font-family: 'Courier New', monospace; color: #666; margin-top: 5px;">${data.input_hex}</div>
            </div>
        </div>
        <div style="width: 100%; height: 150px; background: ${data.input_hex}; border-radius: 10px; margin: 15px 0;"></div>
    `;
    resultsGrid.appendChild(inputCard);
    
    // Results
    data.results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        if (index === 0) card.classList.add('best-match');
        
        const badgeClass = result.similarity >= 95 ? 'similarity-badge excellent' :
                          result.similarity >= 85 ? 'similarity-badge good' : 'similarity-badge';
        
        const labText = result.lab ? `L*${result.lab.L} a*${result.lab.a} b*${result.lab.b}` : 'N/A';
        const cmykText = result.cmyk ? `C:${result.cmyk.c}% M:${result.cmyk.m}% Y:${result.cmyk.y}% K:${result.cmyk.k}%` : 'N/A';
        const rgbText = result.rgb ? `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})` : 'N/A';
        
        // Large color preview instead of image
        const colorPreviewHtml = `<div class="color-preview-only" style="background: ${result.hex};">
            ${result.hex}<br>
            <span style="font-size: 0.8em; opacity: 0.9;">Color Preview</span>
        </div>`;
        
        // Link to original image if available
        const originalLinkHtml = result.original_link ? `
            <a href="${result.original_link}" target="_blank" class="original-link-btn">
                🔗 View original image
            </a>
        ` : '';
        
        card.innerHTML = `
            <div class="result-header">
                <div>
                    <div class="result-code">${result.code}</div>
                    <div class="result-name">${result.name}</div>
                </div>
                <div class="${badgeClass}">${result.similarity}%</div>
            </div>
            
            ${colorPreviewHtml}
            ${originalLinkHtml}
            
            <div class="result-info">
                <div class="info-row"><span class="info-label">TCX Code:</span><span class="info-value">${result.code}</span></div>
                <div class="info-row"><span class="info-label">Name:</span><span class="info-value">${result.name}</span></div>
                <div class="info-row"><span class="info-label">HEX (extracted):</span><span class="info-value" style="background: ${result.hex}; color: ${getContrastColor(result.hex)}; padding: 2px 6px; border-radius: 3px;">${result.hex}</span></div>
                ${result.visual_hex && result.visual_hex !== result.hex ? `<div class="info-row"><span class="info-label">HEX (official):</span><span class="info-value">${result.visual_hex}</span></div>` : ''}
                <div class="info-row"><span class="info-label">RGB:</span><span class="info-value">${rgbText}</span></div>
                <div class="info-row"><span class="info-label">LAB:</span><span class="info-value">${labText}</span></div>
                <div class="info-row"><span class="info-label">CMYK:</span><span class="info-value">${cmykText}</span></div>
                <div class="info-row"><span class="info-label">Delta E:</span><span class="info-value">${result.delta_e}</span></div>
            </div>
            <div class="delta-e-info">${getDeltaEExplanation(result.delta_e)}</div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <button onclick="copyToClipboard('${result.code}')" class="copy-btn-small">📋 Code</button>
                <button onclick="copyToClipboard('${result.hex}')" class="copy-btn-small">📋 HEX</button>
                <button onclick="copyToClipboard('${labText}')" class="copy-btn-small">📋 LAB</button>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
    
    resultsContainer.style.display = 'block';
}

function getDeltaEExplanation(deltaE) {
    if (deltaE < 1) return '⭐ Imperceptible difference to the human eye';
    if (deltaE < 3) return '✅ Very similar - excellent match';
    if (deltaE < 6) return '✓ Similar - good match';
    if (deltaE < 12) return '⚠️ Perceptible difference, but still similar';
    return '⚠️ Significant difference';
}

function getContrastColor(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000' : '#fff';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copied: ${text}`);
    }).catch(err => {
        console.error('Error copying:', err);
    });
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultsContainer.style.display = 'none';
}

