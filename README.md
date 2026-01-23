# 🎨 Smart Color Matcher - Pantone TCX Color Matching System

**Intelligent Pantone TCX color matching system with automatic color extraction from images and precise matching using Delta E (CIE2000).**

---

## 🚀 **New Version v2.0 - Complete Update**

### 📅 **Update Date:** January 23, 2025

This version brings a **complete transformation** of the application, with a modern interface, new advanced features, and important fixes.

---

## 🎯 **What is this Project?**

This project is a **complete web application** that allows:

1. **📷 Image Upload**: Upload fabric/material images and automatically extract the dominant color
2. **🎨 HEX Search**: Enter a hexadecimal code and find the most similar Pantone color
3. **🔬 Precise Matching**: Uses Delta E (CIE2000) algorithm to find exact matches
4. **🧵 Fabric Mode**: Automatic compensation for colors on materials (reflection and texture)
5. **📊 Database**: Full access to Pantone TCX database

---

## ✨ **Main Changes in Version 2.0**

### 🎨 **1. Modern and Styled Interface**

#### **Modern Image Upload Component**
- ✅ **React/Shadcn-inspired design**: Clean and professional interface
- ✅ **Inline SVG icons**: ImagePlus, Upload, Trash2, X (no external dependencies)
- ✅ **Drag & Drop**: Drag and drop images directly into the upload area
- ✅ **Interactive Preview**: 
  - Hover overlay with action buttons
  - Smooth image zoom (scale 1.05)
  - Fluid animations and smooth transitions
- ✅ **Information Bar**: Displays file name with remove button
- ✅ **Extracted Color Card**: Elegant visualization of extracted dominant color

#### **BIOBLANKS Design System**
- ✅ **Primary Colors**: Orange (#ff9533) as primary color
- ✅ **Neutral Background**: Light gray (#f5f5f5) for better readability
- ✅ **BIOBLANKS Logo**: Integrated in header
- ✅ **Clean Typography**: No excessive emojis, focus on functionality

### 🐛 **2. Critical Bug Fixes**

#### **Bug #000000 - Broken Color Extraction** ✅ FIXED
- **Problem**: Application returned `#000000` (black) when extracting color from images
- **Cause**: Incorrect use of `ColorConverter` that didn't exist in the code
- **Solution**: Correct implementation using `colormath` for LAB ↔ RGB ↔ HEX conversions
- **Result**: Color extraction working perfectly

#### **Fabric Mode - Reflection Compensation** ✅ IMPLEMENTED
- **Problem**: Colors on fabrics appear lighter than Pantone references
- **Solution**: Fabric Mode that applies automatic compensation:
  - **-12% Lightness**: Darkens the extracted color
  - **-2% Saturation**: Slightly reduces saturation
- **Result**: More accurate matching for fabric applications

### 🌐 **3. Complete Internationalization**

- ✅ **Full Translation**: Entire application translated to English
- ✅ **Error Messages**: All in English
- ✅ **Clean Interface**: Professional texts without unnecessary emojis
- ✅ **Labels and Buttons**: Consistency throughout the system

### 🔧 **4. Advanced Features**

#### **K-Means Clustering for Color Extraction**
- ✅ K-Means algorithm to identify dominant color
- ✅ Filters white backgrounds and very dark shadows
- ✅ Precise extraction even in complex images

#### **Delta E (CIE2000) Matching**
- ✅ Most accurate algorithm for perceptual color difference
- ✅ Ordered by similarity (lower Delta E = more similar)
- ✅ Support for multiple results (configurable)

#### **Rafaela Factor**
- ✅ Lightness boost option (+5%)
- ✅ Useful for fine adjustments in specific colors

### 📱 **5. Responsiveness and UX**

- ✅ **Mobile-First**: Responsive design for all devices
- ✅ **Smooth Animations**: Professional transitions and hover effects
- ✅ **Visual Feedback**: Loading states, hover effects, error states
- ✅ **Accessibility**: Adequate contrast and intuitive navigation

---

## 📦 **Project Structure**

```
plugin-pantone/
├── 📱 Flask Web Application
│   ├── matcher_app.py          # Main Flask server
│   ├── color_matcher.py        # Matching and extraction logic
│   ├── templates/
│   │   └── matcher.html        # Modern interface
│   └── static/
│       ├── css/matcher.css     # Modern styles
│       └── js/matcher.js        # Interactivity
│
├── 📄 Static Version (GitHub Pages)
│   └── docs/
│       ├── index.html          # Free version (no backend)
│       └── static/             # Static assets
│
└── 🛠️ Processing Scripts
    ├── generate_visual_db.py   # Pantone image extractor
    ├── create_database.py      # Create database
    └── requirements.txt        # Python dependencies
```

---

## 🚀 **How to Use the Web Application**

### **Option 1: Flask Version (Recommended - Full Features)**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start server
python3 matcher_app.py

# 3. Access in browser
# http://localhost:5001
```

**Available features:**
- ✅ Image upload
- ✅ Automatic color extraction
- ✅ HEX search
- ✅ Fabric Mode
- ✅ Rafaela Factor
- ✅ Multiple results

### **Option 2: Static Version (GitHub Pages)**

Access: `https://bioblanks-accounts.github.io/Smart-Color-Matcher/`

**Available features:**
- ✅ HEX search
- ✅ Delta E matching
- ⚠️ Image upload (requires backend)

---

## 🎯 **Detailed Features**

### **1. Image Upload and Color Extraction**

1. **Image Upload**:
   - Click upload area or drag an image
   - Supported formats: PNG, JPG, JPEG, GIF, WEBP
   - Maximum size: 16MB

2. **Automatic Extraction**:
   - K-Means algorithm identifies dominant color
   - Filters white backgrounds and shadows
   - Displays extracted color in HEX

3. **Fabric Mode** (Optional):
   - Compensates fabric reflection
   - Adjusts lightness (-12%) and saturation (-2%)
   - Result: More accurate matching for materials

### **2. HEX Code Search**

1. Enter HEX code (ex: `#bd2c27`)
2. Color preview on the side
3. Click "Find Match"
4. See results ordered by similarity

### **3. Results and Matching**

- **Delta E Score**: Lower is more similar
- **Visualization**: Card with Pantone color, name and code
- **Multiple Results**: Top 5, 10, 20 (configurable)
- **Complete Information**: HEX, RGB, Pantone name

---

## 🔬 **Algorithms and Technologies**

### **K-Means Clustering**
- Identifies color clusters in the image
- Filters noise (white, extreme black)
- Returns most representative dominant color

### **Delta E (CIE2000)**
- Most accurate algorithm for perceptual difference
- Considers human color perception
- Industry standard for color matching

### **Color Space Conversions**
- HEX ↔ RGB ↔ LAB
- Uses `colormath` library for precision
- Support for different illuminants (D65 default)

---

## 📊 **Comparison: Previous Version vs New Version**

| Feature | Previous Version | New Version 2.0 |
|---------|----------------|-----------------|
| **Interface** | Basic | Modern and styled |
| **Image Upload** | Simple | Modern component with drag & drop |
| **Color Extraction** | ❌ Bug #000000 | ✅ Working perfectly |
| **Fabric Mode** | ❌ Didn't exist | ✅ Implemented |
| **Icons** | Emojis | Professional inline SVG |
| **Language** | Portuguese | English |
| **Design** | Basic | BIOBLANKS design system |
| **Animations** | None | Smooth and professional |
| **Responsive** | Partial | Fully responsive |

---

## 🐛 **Fixed Bugs**

### **1. Bug #000000 - Color Extraction**
- **Status**: ✅ FIXED
- **Description**: Application returned black when extracting color
- **Solution**: Fixed LAB conversions using `colormath`

### **2. ColorConverter Didn't Exist**
- **Status**: ✅ FIXED
- **Description**: Error `ImportError: cannot import name 'ColorConverter'`
- **Solution**: Replaced with direct conversions using `colormath`

### **3. Fabric Mode Didn't Work**
- **Status**: ✅ IMPLEMENTED
- **Description**: Reflection compensation wasn't working
- **Solution**: Complete implementation with lightness and saturation adjustments

---

## 🎨 **Design System**

### **Colors**
- **Primary**: `#ff9533` (BIOBLANKS Orange)
- **Background**: `#f5f5f5` (Light neutral gray)
- **Cards**: `#fafafa` (Soft white)
- **Borders**: `#e5e5e5` (Light gray)
- **Text**: `#1a1a1a` (Almost black)
- **Secondary**: `#666` (Medium gray)
- **Danger**: `#ef4444` (Red for destructive actions)

### **Typography**
- **Font**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- **Titles**: Bold, 2.5em
- **Body**: Regular, 1em
- **Monospace**: Courier New (for HEX codes)

### **Components**
- **Buttons**: Rounded borders (10px), soft shadows
- **Cards**: Rounded borders (12px), light shadows
- **Inputs**: Rounded borders (10px), focus states

---

## 📝 **Complete Changelog**

### **v2.0.0 - January 23, 2025**

#### **✨ New Features**
- Modern image upload component with drag & drop
- Inline SVG icons (ImagePlus, Upload, Trash2, X)
- Fabric Mode (reflection compensation for fabrics)
- Interactive preview with hover overlay
- File information bar
- Styled extracted color card
- Smooth animations and transitions
- Complete BIOBLANKS design system

#### **🐛 Fixes**
- Fixed bug #000000 in color extraction
- Fixed ColorConverter doesn't exist error
- Implemented functional Fabric Mode
- Fixed LAB ↔ RGB ↔ HEX conversions

#### **🌐 Internationalization**
- Complete translation to English
- Error messages in English
- Clean interface without excessive emojis

#### **🎨 Design**
- BIOBLANKS colors (#ff9533)
- Neutral background (#f5f5f5)
- BIOBLANKS logo in header
- Modern and responsive layout

#### **📱 UX/UI**
- Complete responsiveness
- Smooth animations
- Improved visual feedback
- Loading and error states

---

## 🛠️ **Technologies Used**

- **Backend**: Python 3.x, Flask
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Image Processing**: PIL/Pillow, NumPy, scikit-learn (K-Means)
- **Colors**: colormath (LAB conversions, Delta E)
- **Database**: JSON (pantone_data.json)

---

## 📋 **Prerequisites**

```bash
# Python 3.7+
pip install -r requirements.txt
```

**Main dependencies:**
- Flask
- Pillow (PIL)
- NumPy
- scikit-learn
- colormath

---

## 🚀 **Deploy**

### **GitHub Pages (Static Version)**
The version in `docs/` is configured for GitHub Pages and is already available.

### **Flask (Production)**
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 matcher_app:app
```

---

## 📄 **License**

This project is for personal/professional use by BIOBLANKS.

---

## 🤝 **Contributions**

Suggestions and improvements are welcome! If you find issues or have ideas, feel free to contribute.

---

## 📞 **Support**

For questions or issues, open an issue in the GitHub repository.

---

## 🎯 **Next Steps (Roadmap)**

- [ ] Support for multiple simultaneous images
- [ ] Search history
- [ ] Results export (PDF, CSV)
- [ ] REST API for integration
- [ ] Dark/light mode
- [ ] More color compensation options

---

---

## 📖 **Additional Documentation**

### **High-Resolution Pantone TCX Image Extractor**

This project also includes scripts to download high-resolution images of Pantone Fashion, Home + Interiors (TCX - Cotton) colors from the Columbia Omni Studio website. The images capture fabric texture and are essential to ensure color fidelity in textile production.

## 🎯 Objective

Extract high-resolution visual reference images from Pantone "Smart Color Swatch Cards", which show:
- Cotton texture
- Fabric weave shadows
- How color reacts to real lighting

These images are much more accurate for production reference than just digital HEX/RGB codes.

## 📋 Prerequisites

```bash
pip install -r requirements.txt
```

## 📁 File Structure

- `generate_visual_db.py` - Main script to process CSV and download images
- `test_single_image.py` - Test script to validate a single image
- `debug_scraper.py` - Debug tool to search URLs
- `pantone_images/` - Folder where images will be saved (created automatically)
- `pantone_visual_db.json` - JSON file with metadata of downloaded images

## 🚀 Usage

### Process complete CSV file

```bash
python generate_visual_db.py minha_tabela.csv
```

The script will:
1. Read the CSV file
2. Search each Pantone code on Columbia Omni Studio website
3. Find the high-resolution image URL (zoom)
4. Download and save the image in `pantone_images/` folder
5. Save metadata in `pantone_visual_db.json`

### Test a single image

Before processing the entire list, you can test with a specific color:

```bash
python test_single_image.py "19-1663 TCX" "Ribbon Red"
```

This will download only that image and you can verify if the quality is adequate.

### Additional options

```bash
# Also extract and save the dominant HEX color (optional)
python generate_visual_db.py minha_tabela.csv --extract-hex
```

## 📊 CSV Format

The CSV must have at least one column with Pantone codes. Automatically recognized columns:

- **Code**: Column with "TCX" or "CODE" in the name (ex: "TCX CODE")
- **Name**: Column named "NAME" (optional)
- **Link**: Column with "LINK" or "URL" in the name (optional, if you already have URLs)

Example:
```csv
TCX CODE,NAME,HEX
11-0103 TCX,Egret,
11-0104 TCX,Vanilla Ice,
19-1663 TCX,Ribbon Red,
```

## 📸 Downloaded Image Format

Images are saved with the format:
```
PANTONE_CODE_Color_Name.jpg
```

Example: `19-1663_TCX_Ribbon_Red.jpg`

All images are saved in the `pantone_images/` folder in high resolution (usually 1024x1024px or 2048x2048px, depending on what's available on the website).

## 💾 Metadata (JSON)

The `pantone_visual_db.json` file contains information about each processed color:

```json
{
    "19-1663 TCX": {
        "name": "Ribbon Red",
        "imageSaved": true,
        "imagePath": "pantone_images/19-1663_TCX_Ribbon_Red.jpg",
        "originalLink": "https://columbiaomnistudio.com/.../image_2048x2048.jpg",
        "visualHex": "#a12345"  // If --extract-hex was used
    }
}
```

## ⚙️ Features

### ✅ Implemented Features

- ✅ Automatic search for high-resolution URLs on Shopify
- ✅ Download and save images in high quality
- ✅ Automatic naming based on Pantone code
- ✅ Processing summary (saves progress every 10 items)
- ✅ Automatic column detection in CSV
- ✅ Error handling and processing resumption
- ✅ Rate limiting to avoid server blocks

### 🔍 How High-Resolution Search Works

The script uses multiple strategies to find the image in higher resolution:

1. **Shopify pattern search**: Searches for URLs with patterns like `_2048x2048`, `_1024x1024`, `_master`, `_zoom`
2. **img tag analysis**: Checks all `<img>` tags and their `srcset` attributes to find the highest resolution
3. **og:image modification**: If necessary, tries to modify the og:image meta tag URL for high-resolution versions

## 🛠️ Troubleshooting

### Image not found

If an image is not found, the script will continue processing the others. You can:
- Verify if the Pantone code is correct in the CSV
- Test manually on the website: `https://columbiaomnistudio.com/search?q=CODE`
- Re-run the script (it skips already downloaded images)

### Insufficient image quality

If the downloaded image is not in sufficient high resolution:
- Check the original URL manually on the website
- The website may have changed structure
- Some colors may not have zoom version available

### Connection error

The script includes delays between requests to avoid blocks. If you still have problems:
- Check your internet connection
- Try increasing delays in the code (`time.sleep()` variable)
- Run again (the script resumes from where it stopped)

## 📝 Important Notes

- ⚠️ **Rate Limiting**: The script includes 1 second delays between requests to be respectful to the server
- 📦 **Progress**: Progress is saved every 10 processed items, so you can interrupt and continue later
- 🔄 **Resumption**: If you run again, the script automatically skips already processed colors
- 💾 **Disk space**: Make sure you have enough space (each image can be 1-5MB)

## 📄 License

This project is for personal/professional use. Respect the terms of use of the Columbia Omni Studio website when using this script.

## 🤝 Contributions

Suggestions and improvements are welcome! If you find issues or have ideas, feel free to contribute.
