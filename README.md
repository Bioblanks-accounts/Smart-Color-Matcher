# 🎯 Smart Color Matcher - Pantone TCX

Intelligent system to find similar Pantone TCX colors using Delta E (CIE2000) and colors extracted from real fabric photos.

## 🌐 Live Demo

🔗 **Access:** [https://bioblanks-accounts.github.io/Smart-Color-Matcher](https://bioblanks-accounts.github.io/Smart-Color-Matcher)

## ✨ Features

- 🎨 **HEX Search**: Enter any HEX color and find the most similar Pantone TCX
- 📊 **Delta E (CIE2000)**: Scientific algorithm to measure visual similarity
- 🖼️ **Real Photos**: Compares with color extracted from real fabric photo (not just official code)
- 📋 **Multiple Formats**: RGB, HEX, LAB, CMYK for production
- 🎯 **Top 5 Matches**: Shows the 5 best results ordered by similarity
- 📸 **Visualization**: Color previews and complete data

## 🚀 How to Use

1. Enter the HEX color code (e.g., `#bd2c27`)
2. Click "Search Match"
3. See the Top 5 results with complete data
4. Copy the values you need (Code, HEX, LAB, CMYK)

## 🔬 Technology

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python + Flask (optional)
- **Algorithm**: Delta E CIE2000 for color comparison
- **Data**: SQLite with 2,643 Pantone TCX colors

## 📊 Example

**Input:** `#bd2c27`

**Output:**
```
🏆 Top 1: 18-1549 TCX - Valiant Poppy
   Similarity: 98.5%
   Delta E: 0.3 (imperceptible)
   LAB: L*35.2 a*45.8 b*28.1
   CMYK: C:0% M:77% Y:83% K:26%
   [Color Preview]
```

## 🛠️ Local Installation

```bash
# Clone the repository
git clone https://github.com/Bioblanks-accounts/Smart-Color-Matcher.git
cd Smart-Color-Matcher

# Install dependencies
pip install -r requirements.txt

# Extract real colors from images (once)
python3 extract_real_colors.py

# Start Flask server
python3 matcher_app.py
```

## 📁 Structure

```
├── matcher_app.py          # Flask server
├── color_matcher.py        # Search logic
├── extract_real_colors.py  # Color extraction
├── build_static.py         # Generates static version
├── templates/              # HTML templates
├── static/                 # CSS/JS
└── docs/                   # Static site (GitHub Pages)
```

## 📄 License

This project is for personal/professional use.

## 🙏 Credits

- Pantone Colors: [Columbia Omni Studio](https://columbiaomnistudio.com)
- Delta E Algorithm: CIE2000
- Color conversions: colormath

---

**Developed to ensure maximum color fidelity in textile production** 🎨
