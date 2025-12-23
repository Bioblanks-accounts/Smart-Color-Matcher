# 🎯 Smart Color Matcher - Pantone TCX

Sistema inteligente para encontrar cores Pantone TCX similares usando Delta E (CIE2000) e cores extraídas de fotos reais de tecidos.

## 🌐 Demo Online

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site)

🔗 **Acesse:** [https://seu-usuario.github.io/pantone-matcher](https://seu-usuario.github.io/pantone-matcher)

## ✨ Funcionalidades

- 🎨 **Busca por HEX**: Digite qualquer cor HEX e encontre o Pantone TCX mais similar
- 📊 **Delta E (CIE2000)**: Algoritmo científico para medir similaridade visual
- 🖼️ **Fotos Reais**: Compara com cor extraída da foto real do tecido (não apenas código oficial)
- 📋 **Múltiplos Formatos**: RGB, HEX, LAB, CMYK para produção
- 🎯 **Top 5 Matches**: Mostra os 5 melhores resultados ordenados por similaridade
- 📸 **Visualização**: Fotos em alta resolução de cada cor

## 🚀 Como Usar

1. Digite o código HEX da cor (ex: `#bd2c27`)
2. Clique em "Buscar Match"
3. Veja os Top 5 resultados com fotos e dados completos
4. Copie os valores necessários (Código, HEX, LAB, CMYK)

## 🔬 Tecnologia

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python + Flask (opcional)
- **Algoritmo**: Delta E CIE2000 para comparação de cores
- **Dados**: SQLite com 2.643 cores Pantone TCX

## 📊 Exemplo

**Input:** `#bd2c27`

**Output:**
```
🏆 Top 1: 18-1549 TCX - Valiant Poppy
   Similaridade: 98.5%
   Delta E: 0.3 (imperceptível)
   LAB: L*35.2 a*45.8 b*28.1
   CMYK: C:0% M:77% Y:83% K:26%
   [Foto do tecido]
```

## 🛠️ Instalação Local

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/pantone-matcher.git
cd pantone-matcher

# Instale dependências
pip install -r requirements.txt

# Extraia cores reais das imagens (uma vez)
python3 extract_real_colors.py

# Inicie servidor Flask
python3 matcher_app.py
```

## 📁 Estrutura

```
├── matcher_app.py          # Servidor Flask
├── color_matcher.py        # Lógica de busca
├── extract_real_colors.py  # Extração de cores
├── build_static.py         # Gera versão estática
├── templates/              # Templates HTML
├── static/                 # CSS/JS
└── docs/                   # Site estático (GitHub Pages)
```

## 📖 Documentação

- [Guia Completo](SMART_COLOR_MATCHER.md)
- [Guia de Deploy](DEPLOY.md)
- [Banco de Dados](BANCO_DE_DADOS.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto é para uso pessoal/profissional.

## 🙏 Créditos

- Cores Pantone: [Columbia Omni Studio](https://columbiaomnistudio.com)
- Algoritmo Delta E: CIE2000
- Conversões de cor: colormath

---

**Desenvolvido para garantir máxima fidelidade de cor na produção têxtil** 🎨

