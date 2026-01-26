/**
 * Smart Color Matcher - Static Version (Client-side image processing)
 * Works without backend - processes images in the browser
 */

let pantoneData = null;

// HEX mode elements
const hexInput = document.getElementById('hexInput');
const colorPreview = document.getElementById('colorPreview');
const searchBtnHex = document.getElementById('searchBtnHex');

// Image Upload mode elements
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const extractedColorBox = document.getElementById('extractedColorBox');
const extractedColorHex = document.getElementById('extractedColorHex');
const searchBtnImage = document.getElementById('searchBtnImage');

// Shared elements
const useExtractedCheck = document.getElementById('useExtracted');
const lightnessBoostCheck = document.getElementById('lightnessBoost');
const fabricModeCheck = document.getElementById('fabricMode');
const resultsContainer = document.getElementById('results');
const resultsGrid = document.getElementById('resultsGrid');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Global variables
let uploadedImageFile = null;
let extractedHexFromImage = null;

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
        }
    });
});

// Load Pantone data
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

// ========== HEX MODE ==========
if (hexInput) {
    hexInput.addEventListener('input', (e) => {
        let hex = e.target.value.trim();
        
        if (hex && !hex.startsWith('#')) {
            hex = '#' + hex;
            e.target.value = hex;
        }
        
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            colorPreview.style.backgroundColor = hex;
            colorPreview.style.display = 'block';
            if (searchBtnHex) searchBtnHex.disabled = false;
        } else {
            colorPreview.style.display = 'none';
            if (searchBtnHex) searchBtnHex.disabled = hex.length < 7;
        }
    });
    
    if (searchBtnHex) {
        searchBtnHex.addEventListener('click', () => performSearchHex());
    }
    
    hexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchBtnHex && !searchBtnHex.disabled) {
            performSearchHex();
        }
    });
}

// ========== IMAGE UPLOAD MODE ==========
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        if (imageInput) imageInput.click();
    });
}

// Paste image (e.g. from Figma "Copy as PNG")
document.addEventListener('paste', (e) => {
    const tab = document.getElementById('imageTab');
    if (!tab || tab.style.display === 'none') return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            if (file) handleImageFile(file);
            return;
        }
    }
});

if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
}

if (searchBtnImage) {
    searchBtnImage.addEventListener('click', () => performSearchImage());
}

// Modern upload buttons handlers
const reuploadBtn = document.getElementById('reuploadBtn');
const removeBtn = document.getElementById('removeBtn');
const fileRemoveBtn = document.getElementById('fileRemoveBtn');

if (reuploadBtn) {
    reuploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (imageInput) imageInput.click();
    });
}

if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeUploadedImage();
    });
}

if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeUploadedImage();
    });
}

function removeUploadedImage() {
    uploadedImageFile = null;
    extractedHexFromImage = null;
    imagePreview.style.display = 'none';
    searchBtnImage.style.display = 'none';
    uploadArea.style.display = 'flex';
    if (imageInput) imageInput.value = '';
    previewImg.src = '';
    extractedColorBox.style.backgroundColor = '';
    extractedColorHex.textContent = '';
    const fileNameElem = document.getElementById('fileName');
    if (fileNameElem) fileNameElem.textContent = '';
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) {
        showError('File too large. Maximum: 16MB');
        return;
    }
    
    uploadedImageFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'flex';
        uploadArea.style.display = 'none';
        searchBtnImage.style.display = 'block';
        
        const fileNameElem = document.getElementById('fileName');
        if (fileNameElem) {
            fileNameElem.textContent = file.name;
        }
        
        // Extract dominant color (client-side)
        extractColorFromImage(file);
    };
    reader.readAsDataURL(file);
}

// Extract dominant color from image (client-side K-Means)
async function extractColorFromImage(file) {
    try {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize to 100x100 for performance
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            
            const imageData = ctx.getImageData(0, 0, 100, 100);
            const pixels = [];
            
            // Filter pixels (remove white backgrounds and very dark shadows)
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                
                // Ignore very white pixels (R, G, B > 240)
                if (r > 240 && g > 240 && b > 240) continue;
                
                // Ignore very dark pixels (all < 10)
                if (r < 10 && g < 10 && b < 10) continue;
                
                pixels.push([r, g, b]);
            }
            
            if (pixels.length === 0) {
                // If all filtered, use all pixels
                for (let i = 0; i < imageData.data.length; i += 4) {
                    pixels.push([
                        imageData.data[i],
                        imageData.data[i + 1],
                        imageData.data[i + 2]
                    ]);
                }
            }
            
            // Simple K-Means (or use average for simplicity)
            const dominantColor = getDominantColor(pixels);
            
            // Apply fabric mode if enabled
            let finalHex = dominantColor;
            if (fabricModeCheck && fabricModeCheck.checked) {
                finalHex = applyFabricMode(dominantColor);
            }
            
            extractedHexFromImage = finalHex;
            extractedColorBox.style.backgroundColor = finalHex;
            extractedColorHex.textContent = finalHex;
        };
        
        img.src = URL.createObjectURL(file);
    } catch (error) {
        showError(`Error processing image: ${error.message}`);
    }
}

// Simple K-Means implementation (or average)
function getDominantColor(pixels) {
    if (pixels.length === 0) return '#000000';
    
    // Simple approach: use average of filtered pixels
    let r = 0, g = 0, b = 0;
    for (const pixel of pixels) {
        r += pixel[0];
        g += pixel[1];
        b += pixel[2];
    }
    
    r = Math.round(r / pixels.length);
    g = Math.round(g / pixels.length);
    b = Math.round(b / pixels.length);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Apply fabric mode compensation (reduce lightness by 12%)
function applyFabricMode(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    // Convert to LAB
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    
    // Reduce lightness by 12%
    lab.L = lab.L * 0.88;
    
    // Slightly reduce saturation (2%)
    lab.a = lab.a * 0.98;
    lab.b = lab.b * 0.98;
    
    // Convert back to RGB
    const newRgb = labToRgb(lab.L, lab.a, lab.b);
    
    return `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
}

// Color conversion functions
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

function labToRgb(L, a, b) {
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    x = x > 0.206897 ? Math.pow(x, 3) : (x - 16/116) / 7.787;
    y = y > 0.206897 ? Math.pow(y, 3) : (y - 16/116) / 7.787;
    z = z > 0.206897 ? Math.pow(z, 3) : (z - 16/116) / 7.787;

    x = x * 95.047 / 100;
    y = y * 100.0 / 100;
    z = z * 108.883 / 100;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b_val = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    b_val = b_val > 0.0031308 ? 1.055 * Math.pow(b_val, 1/2.4) - 0.055 : 12.92 * b_val;

    return {
        r: Math.max(0, Math.min(255, Math.round(r * 255))),
        g: Math.max(0, Math.min(255, Math.round(g * 255))),
        b: Math.max(0, Math.min(255, Math.round(b_val * 255)))
    };
}

function deltaE(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
}

// Search functions
async function performSearchHex() {
    const hex = hexInput.value.trim();
    
    if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
        showError('Please enter a valid HEX code (e.g., #bd2c27)');
        return;
    }
    
    if (!pantoneData) {
        showError('Data still loading. Please wait...');
        return;
    }
    
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    if (searchBtnHex) searchBtnHex.disabled = true;
    
    setTimeout(() => {
        try {
            const results = findSimilarColors(hex, useExtractedCheck.checked, 5);
            displayResults({ input_hex: hex, results });
        } catch (error) {
            showError(`Error: ${error.message}`);
        } finally {
            loading.style.display = 'none';
            if (searchBtnHex) searchBtnHex.disabled = false;
        }
    }, 100);
}

async function performSearchImage() {
    if (!uploadedImageFile || !extractedHexFromImage) {
        showError('Please select an image first and wait for color extraction');
        return;
    }
    
    if (!pantoneData) {
        showError('Data still loading. Please wait...');
        return;
    }
    
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    if (searchBtnImage) searchBtnImage.disabled = true;
    
    setTimeout(() => {
        try {
            let searchHex = extractedHexFromImage;
            
            // Apply lightness boost if enabled
            if (lightnessBoostCheck && lightnessBoostCheck.checked) {
                const rgb = hexToRgb(searchHex);
                if (rgb) {
                    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
                    lab.L = Math.min(100, lab.L * 1.05); // +5% lightness
                    const newRgb = labToRgb(lab.L, lab.a, lab.b);
                    searchHex = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
                }
            }
            
            const results = findSimilarColors(searchHex, useExtractedCheck.checked, 5);
            displayResults({ 
                input_hex: extractedHexFromImage,
                extracted_hex: extractedHexFromImage,
                results 
            });
        } catch (error) {
            showError(`Error: ${error.message}`);
        } finally {
            loading.style.display = 'none';
            if (searchBtnImage) searchBtnImage.disabled = false;
        }
    }, 100);
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
            rgb: rgbColor,
            lab: labColor
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
    inputCard.style.border = '3px solid #ff9533';
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
        
        const labText = result.lab ? `L*${Math.round(result.lab.L)} a*${Math.round(result.lab.a)} b*${Math.round(result.lab.b)}` : 'N/A';
        const cmykText = result.cmyk ? `C:${result.cmyk.c}% M:${result.cmyk.m}% Y:${result.cmyk.y}% K:${result.cmyk.k}%` : 'N/A';
        const rgbText = result.rgb ? `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})` : 'N/A';
        
        const colorPreviewHtml = `<div class="color-preview-only" style="background: ${result.hex};">
            ${result.hex}<br>
            <span style="font-size: 0.8em; opacity: 0.9;">Color Preview</span>
        </div>`;
        
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
    if (deltaE < 1) return '⭐ Imperceptible difference to human eye';
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
