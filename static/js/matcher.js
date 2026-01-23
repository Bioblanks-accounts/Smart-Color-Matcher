/**
 * Smart Color Matcher - Frontend
 */

// HEX mode elements (legacy)
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
        
        // Updates buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Updates contents
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

// ========== HEX MODE (LEGACY) ==========
if (hexInput) {
    hexInput.addEventListener('input', (e) => {
        let hex = e.target.value.trim();
        
        // Adds # if missing
        if (hex && !hex.startsWith('#')) {
            hex = '#' + hex;
            e.target.value = hex;
        }
        
        // Validates and updates preview
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
    const dropzone = uploadArea.querySelector('.upload-dropzone');
    
    // Click to select file
    uploadArea.addEventListener('click', () => {
        if (imageInput) imageInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (dropzone) dropzone.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (dropzone) dropzone.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dropzone) dropzone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

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
    uploadArea.style.display = 'flex'; // Changed to flex for modern layout
    if (imageInput) imageInput.value = '';
    previewImg.src = '';
    extractedColorBox.style.backgroundColor = '';
    extractedColorHex.textContent = '';
    const fileNameElem = document.getElementById('fileName');
    if (fileNameElem) fileNameElem.textContent = '';
}

function handleImageFile(file) {
    // Validates file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }
    
    // Validates size (16MB)
    if (file.size > 16 * 1024 * 1024) {
        showError('File too large. Maximum: 16MB');
        return;
    }
    
    uploadedImageFile = file;
    
    // Shows image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'flex';
        uploadArea.style.display = 'none';
        searchBtnImage.style.display = 'block';
        
        // Show filename
        const fileNameElem = document.getElementById('fileName');
        if (fileNameElem) {
            fileNameElem.textContent = file.name;
        }
        
        // Extracts dominant color (client-side preview)
        extractColorPreview(file);
    };
    reader.readAsDataURL(file);
}

function extractColorPreview(file) {
    // Quick color preview (not the final extraction, just visual)
    const img = new Image();
    img.onload = () => {
        // Creates canvas to process
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        // Gets center pixel (quick preview)
        const imageData = ctx.getImageData(50, 50, 1, 1);
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];
        
        const previewHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        extractedColorBox.style.backgroundColor = previewHex;
        extractedColorHex.textContent = previewHex;
    };
    img.src = URL.createObjectURL(file);
}

async function performSearchHex() {
    const hex = hexInput.value.trim();
    
    if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
        showError('Please enter a valid HEX code (e.g., #bd2c27)');
        return;
    }
    
    // Shows loading
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    if (searchBtnHex) searchBtnHex.disabled = true;
    
    try {
        const response = await fetch('/api/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hex: hex,
                use_extracted: useExtractedCheck.checked,
                lightness_boost: lightnessBoostCheck.checked ? 1.05 : 1.0,
                limit: 5
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error fetching colors');
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        if (searchBtnHex) searchBtnHex.disabled = false;
    }
}

async function performSearchImage() {
    if (!uploadedImageFile) {
        showError('Please select an image first');
        return;
    }
    
    // Shows loading
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    if (searchBtnImage) searchBtnImage.disabled = true;
    
    try {
        // Creates FormData for upload
        const formData = new FormData();
        formData.append('image', uploadedImageFile);
        formData.append('use_extracted', useExtractedCheck.checked);
        formData.append('lightness_boost', lightnessBoostCheck.checked ? 1.05 : 1.0);
        formData.append('fabric_mode', fabricModeCheck.checked);
        formData.append('n_clusters', 3);
        formData.append('limit', 5);
        
        const response = await fetch('/api/match', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error processing image');
        }
        
        const data = await response.json();
        
        // Updates displayed extracted color
        if (data.extracted_hex) {
            extractedHexFromImage = data.extracted_hex;
            extractedColorBox.style.backgroundColor = data.extracted_hex;
            extractedColorHex.textContent = data.extracted_hex;
        }
        
        // Adds extracted_hex to input_hex for display
        data.input_hex = data.extracted_hex || 'N/A';
        
        displayResults(data);
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        if (searchBtnImage) searchBtnImage.disabled = false;
    }
}

function displayResults(data) {
    resultsGrid.innerHTML = '';
    
    if (!data.results || data.results.length === 0) {
        showError('No similar colors found');
        return;
    }
    
    // Header with input color (only shows if valid input_hex)
    if (data.input_hex && data.input_hex !== 'N/A') {
        const inputCard = document.createElement('div');
        inputCard.className = 'result-card';
        inputCard.style.border = '3px solid #667eea';
        inputCard.innerHTML = `
            <div class="result-header">
                <div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333;">Client Color</div>
                    <div style="font-family: 'Courier New', monospace; color: #666; margin-top: 5px;">${data.input_hex}</div>
                    ${extractedHexFromImage ? '<div style="font-size: 0.9em; color: #999; margin-top: 5px;">(Extracted from image)</div>' : ''}
                </div>
            </div>
            <div style="width: 100%; height: 150px; background: ${data.input_hex}; border-radius: 10px; margin: 15px 0;"></div>
        `;
        resultsGrid.appendChild(inputCard);
    }
    
    // Resultados
    data.results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        if (index === 0) {
            card.classList.add('best-match');
        }
        
        // Badge de similaridade
        let badgeClass = 'similarity-badge';
        if (result.similarity >= 95) badgeClass += ' excellent';
        else if (result.similarity >= 85) badgeClass += ' good';
        
        // Image or placeholder
        const imageHtml = result.image_url 
            ? `<img src="${result.image_url}" alt="${result.code}" class="result-image" onclick="window.open('${result.image_url}', '_blank')">`
            : `<div style="width: 100%; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #999;">Image not available</div>`;
        
        // Formata LAB
        const labText = result.lab 
            ? `L*${result.lab.L} a*${result.lab.a} b*${result.lab.b}`
            : 'N/A';
        
        // Formata CMYK
        const cmykText = result.cmyk
            ? `C:${result.cmyk.c}% M:${result.cmyk.m}% Y:${result.cmyk.y}% K:${result.cmyk.k}%`
            : 'N/A';
        
        // Formata RGB
        const rgbText = result.rgb
            ? `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`
            : 'N/A';
        
        // Dimensões da imagem
        const dimsText = result.image_width && result.image_height
            ? `${result.image_width}x${result.image_height}px`
            : 'N/A';
        
        card.innerHTML = `
            <div class="result-header">
                <div>
                    <div class="result-code">${result.code}</div>
                    <div class="result-name">${result.name}</div>
                </div>
                <div class="${badgeClass}">
                    ${result.similarity}%
                </div>
            </div>
            
            ${imageHtml}
            
            <div class="result-info">
                <div class="info-row">
                    <span class="info-label">TCX Code:</span>
                    <span class="info-value">${result.code}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${result.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">HEX (extracted):</span>
                    <span class="info-value" style="background: ${result.hex}; color: ${getContrastColor(result.hex)}; padding: 2px 6px; border-radius: 3px;">${result.hex}</span>
                </div>
                ${result.visual_hex && result.visual_hex !== result.hex ? `
                <div class="info-row">
                    <span class="info-label">HEX (official):</span>
                    <span class="info-value">${result.visual_hex || 'N/A'}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">RGB:</span>
                    <span class="info-value">${rgbText}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">LAB:</span>
                    <span class="info-value">${labText}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CMYK:</span>
                    <span class="info-value">${cmykText}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Delta E:</span>
                    <span class="info-value">${result.delta_e}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dimensions:</span>
                    <span class="info-value">${dimsText}</span>
                </div>
                ${result.file_size_kb ? `
                <div class="info-row">
                    <span class="info-label">Size:</span>
                    <span class="info-value">${(result.file_size_kb / 1024).toFixed(2)} MB</span>
                </div>
                ` : ''}
            </div>
            <div class="delta-e-info">
                ${getDeltaEExplanation(result.delta_e)}
            </div>
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
    if (deltaE < 6) return '✓ Similar - good correspondence';
    if (deltaE < 12) return '⚠️ Noticeable difference, but still similar';
    return '⚠️ Significant difference';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultsContainer.style.display = 'none';
}

function getContrastColor(hex) {
    // Remove #
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return contrast color
    return luminance > 0.5 ? '#000' : '#fff';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copied: ${text}`);
    }).catch(err => {
        console.error('Error copying:', err);
    });
}

