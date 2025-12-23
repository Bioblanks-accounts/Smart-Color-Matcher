/**
 * Intelligent Fabric Picker - Main Application
 */

let currentImage = null;
let currentZoom = 1;
let currentColorData = null;
let sampleSize = 15;

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const colorViewer = document.getElementById('colorViewer');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const colorCode = document.getElementById('colorCode');
const colorName = document.getElementById('colorName');
const sampleSizeSlider = document.getElementById('sampleSize');
const sampleSizeValue = document.getElementById('sampleSizeValue');
const zoomLevel = document.getElementById('zoomLevel');
const colorPreview = document.getElementById('colorPreview');
const rgbValue = document.getElementById('rgbValue');
const hexValue = document.getElementById('hexValue');
const labValue = document.getElementById('labValue');
const cmykValue = document.getElementById('cmykValue');
const copyHexBtn = document.getElementById('copyHex');
const copyLabBtn = document.getElementById('copyLab');
const imageInfo = document.getElementById('imageInfo');

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

sampleSizeSlider.addEventListener('input', (e) => {
    sampleSize = parseInt(e.target.value);
    sampleSizeValue.textContent = `${sampleSize}x${sampleSize} pixels`;
});

document.getElementById('zoomIn').addEventListener('click', () => adjustZoom(1.2));
document.getElementById('zoomOut').addEventListener('click', () => adjustZoom(0.8));
document.getElementById('resetZoom').addEventListener('click', () => {
    currentZoom = 1;
    applyZoom();
});

imageCanvas.addEventListener('click', handleCanvasClick);
copyHexBtn.addEventListener('click', () => copyToClipboard(hexValue.textContent));
copyLabBtn.addEventListener('click', () => copyToClipboard(labValue.textContent));

// Busca
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading(true);
    searchResults.innerHTML = '';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.length === 0) {
            searchResults.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Nenhuma cor encontrada</p>';
            return;
        }

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <div class="result-code">${result.code}</div>
                <div class="result-name">${result.name}</div>
            `;
            item.addEventListener('click', () => loadColor(result.code));
            searchResults.appendChild(item);
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        searchResults.innerHTML = '<p style="padding: 20px; text-align: center; color: red;">Erro ao buscar cores</p>';
    } finally {
        showLoading(false);
    }
}

// Carrega uma cor
async function loadColor(code) {
    showLoading(true);
    colorViewer.style.display = 'none';

    try {
        const response = await fetch(`/api/color/${encodeURIComponent(code)}`);
        if (!response.ok) throw new Error('Cor não encontrada');

        const color = await response.json();

        colorCode.textContent = color.code;
        colorName.textContent = color.name;

        if (color.image_path) {
            await loadImage(color.image_path);
            imageInfo.textContent = `Dimensões: ${color.image_width}x${color.image_height}px`;
        } else {
            imageInfo.textContent = 'Imagem não disponível';
        }

        colorViewer.style.display = 'block';
        searchResults.innerHTML = '';
        searchInput.value = '';
    } catch (error) {
        console.error('Erro ao carregar cor:', error);
        alert('Erro ao carregar a cor');
    } finally {
        showLoading(false);
    }
}

// Carrega imagem no canvas
async function loadImage(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            currentImage = img;
            currentZoom = 1;
            
            // Canvas sempre mantém resolução original da imagem
            imageCanvas.width = img.width;
            imageCanvas.height = img.height;
            
            // Desenha imagem na resolução original
            ctx.drawImage(img, 0, 0);
            applyZoom();
            resolve();
        };
        
        img.onerror = reject;
        img.src = imagePath;
    });
}

// Ajusta zoom
function adjustZoom(factor) {
    currentZoom *= factor;
    currentZoom = Math.max(0.1, Math.min(5, currentZoom)); // Limita entre 10% e 500%
    applyZoom();
}

function applyZoom() {
    if (!currentImage) return;

    // Apenas ajusta o tamanho visual via CSS, mantém resolução original
    const displayWidth = Math.round(currentImage.width * currentZoom);
    const displayHeight = Math.round(currentImage.height * currentZoom);

    imageCanvas.style.width = displayWidth + 'px';
    imageCanvas.style.height = displayHeight + 'px';
    zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
}

// Handle canvas click - Extrai cor média da área
function handleCanvasClick(event) {
    if (!currentImage) return;

    const rect = imageCanvas.getBoundingClientRect();
    // Calcula coordenadas reais no canvas (considerando zoom visual)
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;

    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    // Calcula área de amostra
    const halfSize = Math.floor(sampleSize / 2);
    const startX = Math.max(0, x - halfSize);
    const startY = Math.max(0, y - halfSize);
    const endX = Math.min(imageCanvas.width, x + halfSize);
    const endY = Math.min(imageCanvas.height, y + halfSize);
    const width = endX - startX;
    const height = endY - startY;

    // Obtém dados da imagem da área selecionada
    const imageData = ctx.getImageData(startX, startY, width, height);
    const data = imageData.data;

    // Calcula média RGB
    let r = 0, g = 0, b = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        pixelCount++;
    }

    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    // Armazena e exibe resultado
    currentColorData = { r, g, b };
    displayColorResult(r, g, b);

    // Desenha indicador visual
    drawSampleArea(startX, startY, width, height);
}

// Desenha área de amostra no canvas
function drawSampleArea(x, y, width, height) {
    // Redesenha a imagem (sempre na resolução original)
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(currentImage, 0, 0);

    // Desenha retângulo indicador
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    
    // Desenha um pequeno círculo no centro
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, 3, 0, 2 * Math.PI);
    ctx.fill();
}

// Exibe resultado da cor
function displayColorResult(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const lab = rgbToLab(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    // Atualiza preview
    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    colorPreview.textContent = hex;

    // Atualiza valores
    rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
    hexValue.textContent = hex;
    labValue.textContent = formatLab(lab);
    cmykValue.textContent = formatCmyk(cmyk);
}

// Copia para clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert(`Copiado: ${text}`);
    } catch (err) {
        console.error('Erro ao copiar:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`Copiado: ${text}`);
    }
}

// Loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

