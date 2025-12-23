/**
 * Smart Color Matcher - Frontend
 */

const hexInput = document.getElementById('hexInput');
const colorPreview = document.getElementById('colorPreview');
const searchBtn = document.getElementById('searchBtn');
const useExtractedCheck = document.getElementById('useExtracted');
const resultsContainer = document.getElementById('results');
const resultsGrid = document.getElementById('resultsGrid');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Atualiza preview de cor ao digitar
hexInput.addEventListener('input', (e) => {
    let hex = e.target.value.trim();
    
    // Adiciona # se não tiver
    if (hex && !hex.startsWith('#')) {
        hex = '#' + hex;
        e.target.value = hex;
    }
    
    // Valida e atualiza preview
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        colorPreview.style.backgroundColor = hex;
        colorPreview.style.display = 'block';
        searchBtn.disabled = false;
    } else {
        colorPreview.style.display = 'none';
        searchBtn.disabled = hex.length < 7;
    }
});

// Busca ao clicar
searchBtn.addEventListener('click', performSearch);

// Busca ao pressionar Enter
hexInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !searchBtn.disabled) {
        performSearch();
    }
});

async function performSearch() {
    const hex = hexInput.value.trim();
    
    if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) {
        showError('Por favor, insira um código HEX válido (ex: #bd2c27)');
        return;
    }
    
    // Mostra loading
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorDiv.style.display = 'none';
    searchBtn.disabled = true;
    
    try {
        const response = await fetch('/api/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hex: hex,
                use_extracted: useExtractedCheck.checked,
                limit: 5
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao buscar cores');
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        showError(`Erro: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        searchBtn.disabled = false;
    }
}

function displayResults(data) {
    resultsGrid.innerHTML = '';
    
    if (!data.results || data.results.length === 0) {
        showError('Nenhuma cor similar encontrada');
        return;
    }
    
    // Header com cor de entrada
    const inputCard = document.createElement('div');
    inputCard.className = 'result-card';
    inputCard.style.border = '3px solid #667eea';
    inputCard.innerHTML = `
        <div class="result-header">
            <div>
                <div style="font-size: 1.1em; font-weight: bold; color: #333;">Cor do Cliente</div>
                <div style="font-family: 'Courier New', monospace; color: #666; margin-top: 5px;">${data.input_hex}</div>
            </div>
        </div>
        <div style="width: 100%; height: 150px; background: ${data.input_hex}; border-radius: 10px; margin: 15px 0;"></div>
    `;
    resultsGrid.appendChild(inputCard);
    
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
        
        // Imagem ou placeholder
        const imageHtml = result.image_url 
            ? `<img src="${result.image_url}" alt="${result.code}" class="result-image" onclick="window.open('${result.image_url}', '_blank')">`
            : `<div style="width: 100%; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #999;">Imagem não disponível</div>`;
        
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
                    <span class="info-label">Código TCX:</span>
                    <span class="info-value">${result.code}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${result.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">HEX (extraído):</span>
                    <span class="info-value" style="background: ${result.hex}; color: ${getContrastColor(result.hex)}; padding: 2px 6px; border-radius: 3px;">${result.hex}</span>
                </div>
                ${result.visual_hex && result.visual_hex !== result.hex ? `
                <div class="info-row">
                    <span class="info-label">HEX (oficial):</span>
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
                    <span class="info-label">Dimensões:</span>
                    <span class="info-value">${dimsText}</span>
                </div>
                ${result.file_size_kb ? `
                <div class="info-row">
                    <span class="info-label">Tamanho:</span>
                    <span class="info-value">${(result.file_size_kb / 1024).toFixed(2)} MB</span>
                </div>
                ` : ''}
            </div>
            <div class="delta-e-info">
                ${getDeltaEExplanation(result.delta_e)}
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <button onclick="copyToClipboard('${result.code}')" class="copy-btn-small">📋 Código</button>
                <button onclick="copyToClipboard('${result.hex}')" class="copy-btn-small">📋 HEX</button>
                <button onclick="copyToClipboard('${labText}')" class="copy-btn-small">📋 LAB</button>
            </div>
        `;
        
        resultsGrid.appendChild(card);
    });
    
    resultsContainer.style.display = 'block';
}

function getDeltaEExplanation(deltaE) {
    if (deltaE < 1) return '⭐ Diferença imperceptível ao olho humano';
    if (deltaE < 3) return '✅ Muito similar - excelente match';
    if (deltaE < 6) return '✓ Similar - boa correspondência';
    if (deltaE < 12) return '⚠️ Diferença perceptível, mas ainda similar';
    return '⚠️ Diferença significativa';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    resultsContainer.style.display = 'none';
}

function getContrastColor(hex) {
    // Remove #
    hex = hex.replace('#', '');
    
    // Converte para RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcula luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna cor de contraste
    return luminance > 0.5 ? '#000' : '#fff';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copiado: ${text}`);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}

