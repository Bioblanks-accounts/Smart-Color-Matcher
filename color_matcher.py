#!/usr/bin/env python3
"""
Smart Color Matcher - Encontra cores Pantone mais similares usando Delta E (CIE2000)
"""

import sqlite3
import numpy as np
from PIL import Image
from io import BytesIO
from sklearn.cluster import KMeans

# Fix para numpy.asscalar
if not hasattr(np, 'asscalar'):
    def asscalar(a):
        return np.asarray(a).item()
    np.asscalar = asscalar

from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie2000
from exemplo_uso_banco import PantoneDB

DB_NAME = 'pantone_database.db'

def extract_dominant_color_from_image(image_file, n_clusters=3, fabric_mode=False):
    """
    Extrai a cor dominante de uma imagem usando K-Means.
    
    Esta função processa a imagem considerando texturas e sombras,
    extraindo a cor visualmente perceptível (cor "suja" com trama).
    
    Args:
        image_file: Arquivo de imagem (BytesIO, file object ou caminho)
        n_clusters: Número de clusters para K-Means (1 para cor única, 3 para dominante)
        fabric_mode: Se True, aplica compensação para tecidos (escurece 12%)
    
    Returns:
        HEX da cor dominante (string) ou None em caso de erro
    """
    try:
        # Abre a imagem
        if isinstance(image_file, (BytesIO, bytes)):
            img = Image.open(image_file).convert('RGB')
        elif isinstance(image_file, str):
            img = Image.open(image_file).convert('RGB')
        else:
            img = Image.open(image_file).convert('RGB')
        
        # Redimensiona para 100x100px para performance
        try:
            # Pillow >= 10.0
            img = img.resize((100, 100), Image.Resampling.LANCZOS)
        except AttributeError:
            # Pillow < 10.0
            img = img.resize((100, 100), Image.LANCZOS)
        
        # Converte para array numpy
        img_array = np.array(img)
        pixels = img_array.reshape(-1, 3)
        
        # Filtra pixels brancos e transparentes (fundo)
        # Remove pixels muito claros (R, G, B > 240) e muito escuros (R, G, B < 10)
        # Isso ajuda a ignorar fundos brancos e sombras muito escuras
        filtered_pixels = []
        for pixel in pixels:
            r, g, b = pixel
            # Ignora pixels totalmente brancos (R, G, B > 240)
            if r > 240 and g > 240 and b > 240:
                continue
            # Ignora pixels muito escuros (todos < 10) - provavelmente sombra
            if r < 10 and g < 10 and b < 10:
                continue
            filtered_pixels.append(pixel)
        
        if len(filtered_pixels) == 0:
            # Se todos os pixels foram filtrados, usa todos
            filtered_pixels = pixels.tolist()
        
        filtered_pixels = np.array(filtered_pixels)
        
        if len(filtered_pixels) == 0:
            return None
        
        # Usa K-Means para encontrar cor dominante
        # Se n_clusters=1, retorna a cor média
        # Se n_clusters=3, pega o cluster mais frequente
        kmeans = KMeans(n_clusters=min(n_clusters, len(filtered_pixels)), 
                       random_state=42, n_init=10)
        kmeans.fit(filtered_pixels)
        
        # Pega o cluster mais frequente (cor dominante)
        labels = kmeans.labels_
        unique_labels, counts = np.unique(labels, return_counts=True)
        dominant_cluster_idx = unique_labels[np.argmax(counts)]
        dominant_color = kmeans.cluster_centers_[dominant_cluster_idx]
        
        # Converte para inteiros e garante valores válidos (0-255)
        r = int(np.clip(dominant_color[0], 0, 255))
        g = int(np.clip(dominant_color[1], 0, 255))
        b = int(np.clip(dominant_color[2], 0, 255))
        
        # Converte para HEX
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        
        # COMPENSAÇÃO PARA TECIDO/MATERIAL
        # Quando fotografamos tecido, ele reflete luz e fica mais claro
        # Aplicamos compensação para buscar a cor Pantone que, ao ser aplicada, 
        # resultará na cor fotografada
        if fabric_mode:
            try:
                # Converte RGB para LAB usando colormath
                from colormath.color_objects import sRGBColor, LabColor
                from colormath.color_conversions import convert_color
                
                # Normaliza RGB (0-255 para 0-1)
                rgb_normalized = sRGBColor(r / 255.0, g / 255.0, b / 255.0)
                
                # Converte para LAB
                lab = convert_color(rgb_normalized, LabColor, target_illuminant='d65')
                
                # Reduz lightness em 12% (escurece a cor)
                lab.lab_l = lab.lab_l * 0.88
                
                # Opcional: reduz levemente a saturação (2%)
                lab.lab_a = lab.lab_a * 0.98
                lab.lab_b = lab.lab_b * 0.98
                
                # Converte de volta para RGB
                rgb_adjusted = convert_color(lab, sRGBColor, target_illuminant='d65')
                
                # Converte para inteiros (0-1 para 0-255) e garante range válido
                r = int(np.clip(rgb_adjusted.rgb_r * 255, 0, 255))
                g = int(np.clip(rgb_adjusted.rgb_g * 255, 0, 255))
                b = int(np.clip(rgb_adjusted.rgb_b * 255, 0, 255))
                
                # Converte para HEX
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
            except Exception as e:
                print(f"Warning: Fabric mode compensation failed: {e}")
                # Se falhar, usa a cor original sem compensação
                pass
        
        return hex_color
        
    except Exception as e:
        print(f"Error extracting dominant color: {e}")
        import traceback
        traceback.print_exc()
        return None

class ColorMatcher:
    """Classe para encontrar cores Pantone similares usando Delta E"""
    
    def __init__(self):
        self.db = PantoneDB()
    
    def hex_to_rgb(self, hex_color):
        """Converte HEX para RGB"""
        try:
            hex_color = hex_color.replace('#', '')
            return {
                'r': int(hex_color[0:2], 16),
                'g': int(hex_color[2:4], 16),
                'b': int(hex_color[4:6], 16)
            }
        except:
            return None
    
    def rgb_to_cmyk(self, rgb):
        """Converte RGB para CMYK"""
        if not rgb:
            return None
        try:
            r, g, b = rgb['r'] / 255.0, rgb['g'] / 255.0, rgb['b'] / 255.0
            
            k = 1 - max(r, g, b)
            if k == 1:
                return {'c': 0, 'm': 0, 'y': 0, 'k': 100}
            
            c = (1 - r - k) / (1 - k) * 100
            m = (1 - g - k) / (1 - k) * 100
            y = (1 - b - k) / (1 - k) * 100
            
            return {
                'c': round(c),
                'm': round(m),
                'y': round(y),
                'k': round(k * 100)
            }
        except:
            return None
    
    def hex_to_lab(self, hex_color):
        """Converte HEX para LAB"""
        try:
            # Remove # se existir
            hex_color = hex_color.replace('#', '')
            
            # Converte para RGB
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            
            # Cria objeto sRGBColor
            rgb = sRGBColor(r, g, b, is_upscaled=True)
            
            # Converte para LAB
            lab = convert_color(rgb, LabColor, target_illuminant='d65')
            
            return lab
        except Exception as e:
            print(f"Error converting {hex_color} to LAB: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def find_similar_colors(self, hex_input, limit=5, use_extracted=True, lightness_boost=1.0):
        """
        Encontra cores Pantone mais similares a uma cor HEX.
        
        Args:
            hex_input: Cor HEX do cliente (ex: "#bd2c27")
            limit: Número de resultados a retornar
            use_extracted: Se True, usa extracted_hex; senão, usa visual_hex
            lightness_boost: Fator de ganho de luminosidade (ex: 1.05 = 5% mais claro)
                           Feature "Fator Rafaela" - ajusta para aproximar da realidade física
        
        Returns:
            Lista de dicionários com informações das cores mais similares
        """
        # Converte cor de entrada para LAB
        lab_input = self.hex_to_lab(hex_input)
        if not lab_input:
            return []
        
        # Aplica lightness_boost (Feature "Fator Rafaela")
        # O físico tende a ser um pouco mais claro que a textura digital escura
        if lightness_boost != 1.0:
            lab_input.lab_l = min(100, lab_input.lab_l * lightness_boost)
        
        # Busca todas as cores do banco
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Escolhe qual coluna usar para comparação
        hex_column = 'extracted_hex' if use_extracted else 'visual_hex'
        
        cursor.execute(f'''
            SELECT code, name, {hex_column} as hex_color, visual_hex, extracted_hex,
                   image_path, image_saved, image_width, image_height, 
                   file_size_kb, original_link
            FROM pantone_colors
            WHERE {hex_column} IS NOT NULL AND {hex_column} != '' AND image_saved = 1
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        # Calcula Delta E para cada cor
        matches = []
        
        for row in results:
            hex_db = row['hex_color']
            if not hex_db:
                continue
            
            # Converte cor do banco para LAB
            lab_db = self.hex_to_lab(hex_db)
            if not lab_db:
                continue
            
            # Calcula Delta E (distância visual)
            delta_e = delta_e_cie2000(lab_input, lab_db)
            
            # Calcula similaridade percentual (aproximado)
            # Delta E < 1 = imperceptível
            # Delta E < 3 = muito similar
            # Delta E < 6 = similar
            # Delta E > 6 = perceptível diferença
            similarity = max(0, 100 - (delta_e * 5))  # Aproximação
            
            # Calcula LAB e CMYK para a cor extraída
            lab_color = self.hex_to_lab(hex_db)
            rgb_color = self.hex_to_rgb(hex_db)
            cmyk_color = self.rgb_to_cmyk(rgb_color) if rgb_color else None
            
            # Acessa colunas (sqlite3.Row não tem .get())
            visual_hex = row['visual_hex'] if 'visual_hex' in row.keys() else None
            extracted_hex = row['extracted_hex'] if 'extracted_hex' in row.keys() else None
            file_size_kb = row['file_size_kb'] if 'file_size_kb' in row.keys() else None
            original_link = row['original_link'] if 'original_link' in row.keys() else None
            
            matches.append({
                'code': row['code'],
                'name': row['name'],
                'hex': hex_db,
                'visual_hex': visual_hex,
                'extracted_hex': extracted_hex,
                'delta_e': round(delta_e, 2),
                'similarity': round(similarity, 1),
                'image_path': row['image_path'],
                'image_saved': bool(row['image_saved']),
                'image_width': row['image_width'] if row['image_width'] else None,
                'image_height': row['image_height'] if row['image_height'] else None,
                'file_size_kb': file_size_kb,
                'original_link': original_link,
                'lab': {
                    'L': round(lab_color.lab_l, 2) if lab_color else None,
                    'a': round(lab_color.lab_a, 2) if lab_color else None,
                    'b': round(lab_color.lab_b, 2) if lab_color else None
                } if lab_color else None,
                'cmyk': cmyk_color,
                'rgb': rgb_color
            })
        
        # Ordena por Delta E (menor = mais similar)
        matches.sort(key=lambda x: x['delta_e'])
        
        # Retorna top N
        return matches[:limit]
    
    def find_by_code(self, code):
        """Busca uma cor específica pelo código"""
        return self.db.get_by_code(code)
    
    def find_similar_colors_from_image(self, image_file, limit=5, use_extracted=True, 
                                       lightness_boost=1.05, n_clusters=3, fabric_mode=False):
        """
        Extrai cor dominante de uma imagem e encontra Pantone correspondente.
        
        Args:
            image_file: Arquivo de imagem (upload)
            limit: Número de resultados a retornar
            use_extracted: Se True, usa extracted_hex; senão, usa visual_hex
            lightness_boost: Fator de ganho de luminosidade (padrão: 1.05 = 5% mais claro)
            fabric_mode: Se True, aplica compensação para tecidos (escurece 12%)
            n_clusters: Número de clusters para K-Means (padrão: 3)
        
        Returns:
            Dicionário com:
                - extracted_hex: HEX da cor extraída da imagem
                - results: Lista de cores Pantone similares
        """
        # Extracts dominant color from image
        extracted_hex = extract_dominant_color_from_image(image_file, n_clusters=n_clusters, fabric_mode=fabric_mode)
        
        if not extracted_hex:
            return {
                'extracted_hex': None,
                'results': [],
                'error': 'Could not extract color from image'
            }
        
        # Searches for similar colors
        results = self.find_similar_colors(
            extracted_hex, 
            limit=limit, 
            use_extracted=use_extracted,
            lightness_boost=lightness_boost
        )
        
        return {
            'extracted_hex': extracted_hex,
            'results': results
        }

def main():
    """Teste da função"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Encontra cores Pantone similares')
    parser.add_argument('hex', help='Cor HEX para buscar (ex: #bd2c27)')
    parser.add_argument('--limit', type=int, default=5, help='Número de resultados')
    parser.add_argument('--use-official', action='store_true', 
                       help='Usa visual_hex ao invés de extracted_hex')
    
    args = parser.parse_args()
    
    matcher = ColorMatcher()
    results = matcher.find_similar_colors(
        args.hex, 
        limit=args.limit,
        use_extracted=not args.use_official
    )
    
    if not results:
        print(f"❌ Nenhuma cor similar encontrada para {args.hex}")
        return
    
    print(f"\n🎨 Cores mais similares a {args.hex}:\n")
    
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['code']} - {result['name']}")
        print(f"   HEX: {result['hex']}")
        print(f"   Delta E: {result['delta_e']} (Similaridade: {result['similarity']}%)")
        print(f"   {'✓' if result['image_saved'] else '✗'} Imagem disponível")
        print()

if __name__ == "__main__":
    main()

