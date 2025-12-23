# 🆓 Deploy Gratuito - Smart Color Matcher

Guia para colocar sua aplicação no ar **100% GRATUITO** usando GitHub Pages.

## ✨ Versão Gratuita - O que inclui:

- ✅ Busca por similaridade de cores (Delta E)
- ✅ Dados completos: RGB, HEX, LAB, CMYK
- ✅ Previews de cor (não precisa de imagens)
- ✅ Top 5 matches
- ✅ Copiar valores (Código, HEX, LAB)
- ✅ Link para ver imagem original no site Columbia
- ⚠️ Sem imagens locais (usa previews de cor)

## 🚀 Deploy em 3 Passos (5 minutos)

### Passo 1: Gerar versão gratuita

```bash
python3 build_free_version.py
```

Isso gera:
- `docs/pantone_data.json` (~500KB - muito menor!)
- `docs/index.html` (versão otimizada)
- Arquivos CSS/JS

### Passo 2: Criar repositório no GitHub

1. Acesse [github.com](https://github.com) → New repository
2. Nome: `pantone-matcher` (ou qualquer nome)
3. Público
4. **NÃO** marque "Initialize with README"
5. Create

### Passo 3: Enviar e publicar

```bash
cd /Users/jonathancavalcanti/Downloads/plugin-pantone

# Inicializa git (se ainda não fez)
git init
git add docs/ .gitignore README_GITHUB.md
git commit -m "Add free version - Smart Color Matcher"

# Adicione SEU repositório
git remote add origin https://github.com/SEU-USUARIO/pantone-matcher.git
git branch -M main
git push -u origin main
```

### Passo 4: Ativar GitHub Pages

1. No GitHub: **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/docs**
5. **Save**

### Pronto! 🎉

Aguarde 1-2 minutos e acesse:
```
https://SEU-USUARIO.github.io/pantone-matcher
```

---

## 🎯 O que sua designer vai ver:

1. **Campo de busca**: Digita HEX (ex: `#bd2c27`)
2. **Resultados**: Top 5 cores Pantone similares
3. **Para cada resultado:**
   - Código TCX
   - Nome da cor
   - **Preview grande da cor** (retângulo colorido)
   - RGB, HEX, LAB, CMYK
   - Delta E e similaridade
   - Botão "Ver imagem original" (link para Columbia Omni Studio)
   - Botões para copiar (Código, HEX, LAB)

---

## 💡 Vantagens da Versão Gratuita:

✅ **100% Grátis** - Sem custos  
✅ **Rápido** - JSON pequeno (~500KB)  
✅ **Funcional** - Todos os dados de cor  
✅ **Fácil** - Deploy em minutos  
✅ **Sempre online** - GitHub Pages é estável  

---

## 📊 Comparação:

| Recurso | Versão Gratuita | Versão Completa |
|---------|----------------|-----------------|
| Busca por HEX | ✅ | ✅ |
| Delta E | ✅ | ✅ |
| RGB/HEX/LAB/CMYK | ✅ | ✅ |
| Preview de cor | ✅ (retângulo) | ✅ (foto) |
| Fotos do tecido | ❌ | ✅ |
| Tamanho | ~500KB | ~50MB+ |

---

## 🔄 Atualizar depois

Se precisar atualizar os dados:

```bash
# Re-executa o build
python3 build_free_version.py

# Envia para GitHub
git add docs/
git commit -m "Update data"
git push
```

GitHub Pages atualiza automaticamente em 1-2 minutos.

---

## 🎨 Preview da Interface

A versão gratuita mostra:
- **Preview grande da cor** ao invés de foto
- **Todos os dados** (RGB, LAB, CMYK) para produção
- **Link para imagem original** se quiser ver a foto

**Perfeito para testar e usar na produção!** ✅

---

## ❓ FAQ

**P: Posso adicionar imagens depois?**
R: Sim! Se conseguir um CDN gratuito (Cloudflare R2 tem tier gratuito), pode usar a versão completa.

**P: A versão gratuita funciona bem?**
R: Sim! Para produção têxtil, os dados de cor (LAB, CMYK) são o mais importante. As fotos são úteis para visualização, mas não essenciais.

**P: Posso usar em produção?**
R: Sim! Os dados de cor são 100% precisos. A única diferença é não ter as fotos locais.

---

**Pronto para colocar no ar agora mesmo! 🚀**

