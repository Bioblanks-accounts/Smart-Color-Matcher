#!/usr/bin/env python3
"""
Flask Web Application - Smart Color Matcher
Aplicação web para encontrar cores Pantone similares usando Delta E
"""

# Fix numpy.asscalar antes de importar color_matcher
import numpy as np
if not hasattr(np, 'asscalar'):
    def asscalar(a):
        return np.asarray(a).item()
    np.asscalar = asscalar

from flask import Flask, render_template, jsonify, send_file, request
from color_matcher import ColorMatcher
from werkzeug.utils import secure_filename
from io import BytesIO
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
matcher = ColorMatcher()

# Extensões permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Página principal"""
    return render_template('matcher.html')

@app.route('/api/match', methods=['POST'])
def match_color():
    """Encontra cores similares - aceita HEX ou upload de imagem"""
    # Verifica se é upload de imagem
    if 'image' in request.files:
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No image file provided'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
        
        try:
            # Lê o arquivo em memória
            image_data = file.read()
            image_file = BytesIO(image_data)
            
            # Parâmetros opcionais
            use_extracted = request.form.get('use_extracted', 'true').lower() == 'true'
            limit = int(request.form.get('limit', 5))
            lightness_boost = float(request.form.get('lightness_boost', 1.05))
            n_clusters = int(request.form.get('n_clusters', 3))
            fabric_mode = request.form.get('fabric_mode', 'true').lower() == 'true'
            
            # Extrai cor e busca similares
            result = matcher.find_similar_colors_from_image(
                image_file,
                limit=limit,
                use_extracted=use_extracted,
                lightness_boost=lightness_boost,
                n_clusters=n_clusters,
                fabric_mode=fabric_mode
            )
            
            if result.get('error'):
                return jsonify(result), 400
            
            # Adiciona URLs das imagens
            for match in result['results']:
                image_path = match.get('image_path')
                if image_path:
                    if not os.path.isabs(image_path):
                        possible_paths = [
                            os.path.join('pantone_images', os.path.basename(image_path)),
                            image_path
                        ]
                        for path in possible_paths:
                            if os.path.exists(path):
                                image_path = os.path.abspath(path)
                                match['image_path'] = image_path
                                break
                    
                    if image_path and os.path.exists(image_path):
                        match['image_url'] = f"/api/image/{match['code']}"
                    else:
                        match['image_url'] = None
                else:
                    match['image_url'] = None
            
            return jsonify(result)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Error processing image: {str(e)}'}), 500
    
    # Modo HEX (compatibilidade com versão anterior)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided. Send HEX or upload image'}), 400
    
    hex_color = data.get('hex', '').strip()
    
    if not hex_color:
        return jsonify({'error': 'HEX color is required'}), 400
    
    # Adiciona # se não tiver
    if not hex_color.startswith('#'):
        hex_color = '#' + hex_color
    
    # Valida formato HEX
    hex_color = hex_color.upper()
    if len(hex_color) != 7 or not all(c in '0123456789ABCDEF' for c in hex_color[1:]):
        return jsonify({'error': 'Invalid HEX color format'}), 400
    
    # Usa extracted_hex se disponível, senão visual_hex
    use_extracted = data.get('use_extracted', True)
    limit = data.get('limit', 5)
    lightness_boost = data.get('lightness_boost', 1.0)
    
    try:
        results = matcher.find_similar_colors(
            hex_color, 
            limit=limit, 
            use_extracted=use_extracted,
            lightness_boost=lightness_boost
        )
        
        # Adiciona URL da imagem e garante que image_path existe
        for result in results:
            # Garante que image_path está absoluto e existe
            image_path = result.get('image_path')
            if image_path:
                # Se for relativo, tenta encontrar
                if not os.path.isabs(image_path):
                    possible_paths = [
                        os.path.join('pantone_images', os.path.basename(image_path)),
                        image_path
                    ]
                    for path in possible_paths:
                        if os.path.exists(path):
                            image_path = os.path.abspath(path)
                            result['image_path'] = image_path
                            break
                else:
                    if not os.path.exists(image_path):
                        image_path = None
                
                if image_path and os.path.exists(image_path):
                    result['image_url'] = f"/api/image/{result['code']}"
                else:
                    result['image_url'] = None
            else:
                result['image_url'] = None
        
        return jsonify({
            'input_hex': hex_color,
            'results': results
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/<code>')
def get_image(code):
    """Retorna a imagem de uma cor"""
    try:
        color = matcher.find_by_code(code)
        if not color:
            return jsonify({'error': 'Color not found'}), 404
        
        image_path = color.get('image_path')
        
        # Tenta vários caminhos
        if not image_path or not os.path.exists(image_path):
            # Tenta caminho relativo
            if image_path:
                possible_path = os.path.join('pantone_images', os.path.basename(image_path))
                if os.path.exists(possible_path):
                    image_path = possible_path
                else:
                    return jsonify({'error': f'Image not found: {color.get("image_path")}'}), 404
            else:
                return jsonify({'error': 'No image path in database'}), 404
        
        return send_file(image_path, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/color/<code>')
def get_color(code):
    """Retorna informações de uma cor"""
    color = matcher.find_by_code(code)
    if not color:
        return jsonify({'error': 'Color not found'}), 404
    
    return jsonify(dict(color))

if __name__ == '__main__':
    print("="*60)
    print("🎨 Smart Color Matcher")
    print("="*60)
    print("\n🌐 Servidor iniciando...")
    print("   Acesse: http://127.0.0.1:5001")
    print("="*60)
    app.run(debug=True, host='127.0.0.1', port=5001)

