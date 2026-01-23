# 🎨 Smart Color Matcher - Pantone TCX Color Matching System

**Sistema inteligente de correspondência de cores Pantone TCX com extração automática de cor de imagens e matching preciso usando Delta E (CIE2000).**

---

## 🚀 **Nova Versão v2.0 - Atualização Completa**

### 📅 **Data da Atualização:** Dezembro 2024

Esta versão traz uma **transformação completa** da aplicação, com interface moderna, novas funcionalidades avançadas e correções importantes.

---

## 🎯 **O que é este Projeto?**

Este projeto é uma **aplicação web completa** que permite:

1. **📷 Upload de Imagens**: Faça upload de imagens de tecidos/materiais e extraia automaticamente a cor dominante
2. **🎨 Busca por HEX**: Digite um código hexadecimal e encontre a cor Pantone mais similar
3. **🔬 Matching Preciso**: Usa algoritmo Delta E (CIE2000) para encontrar correspondências exatas
4. **🧵 Modo Tecido**: Compensação automática para cores em materiais (reflexão e textura)
5. **📊 Banco de Dados**: Acesso completo ao banco de dados Pantone TCX

---

## ✨ **Principais Mudanças da Versão 2.0**

### 🎨 **1. Interface Moderna e Estilizada**

#### **Componente de Upload de Imagem Moderno**
- ✅ **Design inspirado em React/Shadcn**: Interface limpa e profissional
- ✅ **Ícones SVG inline**: ImagePlus, Upload, Trash2, X (sem dependências externas)
- ✅ **Drag & Drop**: Arraste e solte imagens diretamente na área de upload
- ✅ **Preview Interativo**: 
  - Hover overlay com botões de ação
  - Zoom suave na imagem (scale 1.05)
  - Animações fluidas e transições suaves
- ✅ **Barra de Informações**: Exibe nome do arquivo com botão de remoção
- ✅ **Card de Cor Extraída**: Visualização elegante da cor dominante extraída

#### **Design System BIOBLANKS**
- ✅ **Cores Principais**: Laranja (#ff9533) como cor primária
- ✅ **Fundo Neutro**: Cinza claro (#f5f5f5) para melhor legibilidade
- ✅ **Logo BIOBLANKS**: Integrado no header
- ✅ **Tipografia Limpa**: Sem emojis excessivos, foco na funcionalidade

### 🐛 **2. Correções Críticas de Bugs**

#### **Bug #000000 - Extração de Cor Quebrada** ✅ CORRIGIDO
- **Problema**: Aplicação retornava `#000000` (preto) ao extrair cor de imagens
- **Causa**: Uso incorreto de `ColorConverter` que não existia no código
- **Solução**: Implementação correta usando `colormath` para conversões LAB ↔ RGB ↔ HEX
- **Resultado**: Extração de cor funcionando perfeitamente

#### **Fabric Mode - Compensação de Reflexão** ✅ IMPLEMENTADO
- **Problema**: Cores em tecidos aparecem mais claras que referências Pantone
- **Solução**: Modo Tecido que aplica compensação automática:
  - **-12% Lightness**: Escurece a cor extraída
  - **-2% Saturation**: Reduz levemente a saturação
- **Resultado**: Matching mais preciso para aplicações em tecidos

### 🌐 **3. Internacionalização Completa**

- ✅ **Tradução Total**: Toda aplicação traduzida para inglês
- ✅ **Mensagens de Erro**: Todas em inglês
- ✅ **Interface Limpa**: Textos profissionais sem emojis desnecessários
- ✅ **Labels e Botões**: Consistência em todo o sistema

### 🔧 **4. Funcionalidades Avançadas**

#### **K-Means Clustering para Extração de Cor**
- ✅ Algoritmo K-Means para identificar cor dominante
- ✅ Filtragem de fundos brancos e sombras muito escuras
- ✅ Extração precisa mesmo em imagens complexas

#### **Delta E (CIE2000) Matching**
- ✅ Algoritmo mais preciso para diferença perceptiva de cores
- ✅ Ordenação por similaridade (menor Delta E = mais similar)
- ✅ Suporte a múltiplos resultados (configurável)

#### **Rafaela Factor**
- ✅ Opção de boost de lightness (+5%)
- ✅ Útil para ajustes finos em cores específicas

### 📱 **5. Responsividade e UX**

- ✅ **Mobile-First**: Design responsivo para todos os dispositivos
- ✅ **Animações Suaves**: Transições e hover effects profissionais
- ✅ **Feedback Visual**: Loading states, hover effects, estados de erro
- ✅ **Acessibilidade**: Contraste adequado e navegação intuitiva

---

## 📦 **Estrutura do Projeto**

```
plugin-pantone/
├── 📱 Aplicação Web Flask
│   ├── matcher_app.py          # Servidor Flask principal
│   ├── color_matcher.py        # Lógica de matching e extração
│   ├── templates/
│   │   └── matcher.html        # Interface moderna
│   └── static/
│       ├── css/matcher.css     # Estilos modernos
│       └── js/matcher.js        # Interatividade
│
├── 📄 Versão Estática (GitHub Pages)
│   └── docs/
│       ├── index.html          # Versão free (sem backend)
│       └── static/             # Assets estáticos
│
└── 🛠️ Scripts de Processamento
    ├── generate_visual_db.py   # Extrator de imagens Pantone
    ├── create_database.py      # Criar banco de dados
    └── requirements.txt        # Dependências Python
```

---

## 🚀 **Como Usar a Aplicação Web**

### **Opção 1: Versão Flask (Recomendada - Funcionalidades Completas)**

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Iniciar servidor
python3 matcher_app.py

# 3. Acessar no navegador
# http://localhost:5001
```

**Funcionalidades disponíveis:**
- ✅ Upload de imagens
- ✅ Extração automática de cor
- ✅ Busca por HEX
- ✅ Fabric Mode
- ✅ Rafaela Factor
- ✅ Múltiplos resultados

### **Opção 2: Versão Estática (GitHub Pages)**

Acesse: `https://bioblanks-accounts.github.io/Smart-Color-Matcher/`

**Funcionalidades disponíveis:**
- ✅ Busca por HEX
- ✅ Matching com Delta E
- ⚠️ Upload de imagem (requer backend)

---

## 🎯 **Funcionalidades Detalhadas**

### **1. Upload e Extração de Cor de Imagens**

1. **Upload de Imagem**:
   - Clique na área de upload ou arraste uma imagem
   - Formatos suportados: PNG, JPG, JPEG, GIF, WEBP
   - Tamanho máximo: 16MB

2. **Extração Automática**:
   - Algoritmo K-Means identifica cor dominante
   - Filtra fundos brancos e sombras
   - Exibe cor extraída em HEX

3. **Fabric Mode** (Opcional):
   - Compensa reflexão de tecidos
   - Ajusta lightness (-12%) e saturação (-2%)
   - Resultado: Matching mais preciso para materiais

### **2. Busca por Código HEX**

1. Digite código HEX (ex: `#bd2c27`)
2. Preview da cor ao lado
3. Clique em "Find Match"
4. Veja resultados ordenados por similaridade

### **3. Resultados e Matching**

- **Delta E Score**: Quanto menor, mais similar
- **Visualização**: Card com cor Pantone, nome e código
- **Múltiplos Resultados**: Top 5, 10, 20 (configurável)
- **Informações Completas**: HEX, RGB, nome Pantone

---

## 🔬 **Algoritmos e Tecnologias**

### **K-Means Clustering**
- Identifica clusters de cores na imagem
- Filtra ruídos (branco, preto extremo)
- Retorna cor dominante mais representativa

### **Delta E (CIE2000)**
- Algoritmo mais preciso para diferença perceptiva
- Considera percepção humana de cor
- Padrão da indústria para matching de cores

### **Conversões de Espaço de Cor**
- HEX ↔ RGB ↔ LAB
- Usa biblioteca `colormath` para precisão
- Suporte a diferentes iluminantes (D65 padrão)

---

## 📊 **Comparação: Versão Anterior vs Nova Versão**

| Recurso | Versão Anterior | Nova Versão 2.0 |
|---------|----------------|-----------------|
| **Interface** | Básica | Moderna e estilizada |
| **Upload de Imagem** | Simples | Componente moderno com drag & drop |
| **Extração de Cor** | ❌ Bug #000000 | ✅ Funcionando perfeitamente |
| **Fabric Mode** | ❌ Não existia | ✅ Implementado |
| **Ícones** | Emojis | SVG inline profissionais |
| **Idioma** | Português | Inglês |
| **Design** | Básico | Sistema de design BIOBLANKS |
| **Animações** | Nenhuma | Suaves e profissionais |
| **Responsivo** | Parcial | Totalmente responsivo |

---

## 🐛 **Bugs Corrigidos**

### **1. Bug #000000 - Extração de Cor**
- **Status**: ✅ CORRIGIDO
- **Descrição**: Aplicação retornava preto ao extrair cor
- **Solução**: Correção de conversões LAB usando `colormath`

### **2. ColorConverter Não Existia**
- **Status**: ✅ CORRIGIDO
- **Descrição**: Erro `ImportError: cannot import name 'ColorConverter'`
- **Solução**: Substituído por conversões diretas com `colormath`

### **3. Fabric Mode Não Funcionava**
- **Status**: ✅ IMPLEMENTADO
- **Descrição**: Compensação de reflexão não estava funcionando
- **Solução**: Implementação completa com ajustes de lightness e saturação

---

## 🎨 **Design System**

### **Cores**
- **Primária**: `#ff9533` (Laranja BIOBLANKS)
- **Fundo**: `#f5f5f5` (Cinza claro neutro)
- **Cards**: `#fafafa` (Branco suave)
- **Bordas**: `#e5e5e5` (Cinza claro)
- **Texto**: `#1a1a1a` (Quase preto)
- **Secundário**: `#666` (Cinza médio)
- **Perigo**: `#ef4444` (Vermelho para ações destrutivas)

### **Tipografia**
- **Fonte**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- **Títulos**: Bold, 2.5em
- **Corpo**: Regular, 1em
- **Monospace**: Courier New (para códigos HEX)

### **Componentes**
- **Botões**: Bordas arredondadas (10px), sombras suaves
- **Cards**: Bordas arredondadas (12px), sombras leves
- **Inputs**: Bordas arredondadas (10px), focus states

---

## 📝 **Changelog Completo**

### **v2.0.0 - Dezembro 2024**

#### **✨ Novas Funcionalidades**
- Componente moderno de upload de imagem com drag & drop
- Ícones SVG inline (ImagePlus, Upload, Trash2, X)
- Fabric Mode (compensação de reflexão para tecidos)
- Preview interativo com hover overlay
- Barra de informações do arquivo
- Card de cor extraída estilizado
- Animações e transições suaves
- Design system BIOBLANKS completo

#### **🐛 Correções**
- Corrigido bug #000000 na extração de cor
- Corrigido erro ColorConverter não existe
- Implementado Fabric Mode funcional
- Corrigidas conversões LAB ↔ RGB ↔ HEX

#### **🌐 Internacionalização**
- Tradução completa para inglês
- Mensagens de erro em inglês
- Interface limpa sem emojis excessivos

#### **🎨 Design**
- Cores BIOBLANKS (#ff9533)
- Fundo neutro (#f5f5f5)
- Logo BIOBLANKS no header
- Layout moderno e responsivo

#### **📱 UX/UI**
- Responsividade completa
- Animações suaves
- Feedback visual melhorado
- Estados de loading e erro

---

## 🛠️ **Tecnologias Utilizadas**

- **Backend**: Python 3.x, Flask
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Processamento de Imagem**: PIL/Pillow, NumPy, scikit-learn (K-Means)
- **Cores**: colormath (conversões LAB, Delta E)
- **Banco de Dados**: JSON (pantone_data.json)

---

## 📋 **Pré-requisitos**

```bash
# Python 3.7+
pip install -r requirements.txt
```

**Dependências principais:**
- Flask
- Pillow (PIL)
- NumPy
- scikit-learn
- colormath

---

## 🚀 **Deploy**

### **GitHub Pages (Versão Estática)**
A versão em `docs/` está configurada para GitHub Pages e já está disponível.

### **Flask (Produção)**
```bash
# Usar gunicorn para produção
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 matcher_app:app
```

---

## 📄 **Licença**

Este projeto é para uso pessoal/profissional da BIOBLANKS.

---

## 🤝 **Contribuições**

Sugestões e melhorias são bem-vindas! Se encontrar problemas ou tiver ideias, sinta-se à vontade para contribuir.

---

## 📞 **Suporte**

Para questões ou problemas, abra uma issue no repositório GitHub.

---

## 🎯 **Próximos Passos (Roadmap)**

- [ ] Suporte a múltiplas imagens simultâneas
- [ ] Histórico de buscas
- [ ] Exportação de resultados (PDF, CSV)
- [ ] API REST para integração
- [ ] Modo escuro/claro
- [ ] Mais opções de compensação de cor

---

---

## 📖 **Documentação Adicional**

### **Extrator de Imagens Pantone TCX em Alta Resolução**

Este projeto também inclui scripts para baixar imagens em alta resolução das cores Pantone Fashion, Home + Interiors (TCX - Cotton) do site Columbia Omni Studio. As imagens capturam a textura do tecido e são essenciais para garantir fidelidade de cor na produção têxtil.

## 🎯 Objetivo

Extrair imagens de referência visual em alta resolução dos "Smart Color Swatch Cards" Pantone, que mostram:
- A textura do algodão
- As sombras das tramas do tecido
- Como a cor reage à iluminação real

Essas imagens são muito mais precisas para referência de produção do que apenas códigos HEX/RGB digitais.

## 📋 Pré-requisitos

```bash
pip install -r requirements.txt
```

## 📁 Estrutura de Arquivos

- `generate_visual_db.py` - Script principal para processar o CSV e baixar imagens
- `test_single_image.py` - Script de teste para validar uma única imagem
- `debug_scraper.py` - Ferramenta de debug para buscar URLs
- `pantone_images/` - Pasta onde as imagens serão salvas (criada automaticamente)
- `pantone_visual_db.json` - Arquivo JSON com metadados das imagens baixadas

## 🚀 Uso

### Processar arquivo CSV completo

```bash
python generate_visual_db.py minha_tabela.csv
```

O script vai:
1. Ler o arquivo CSV
2. Buscar cada código Pantone no site Columbia Omni Studio
3. Encontrar a URL da imagem em alta resolução (zoom)
4. Baixar e salvar a imagem na pasta `pantone_images/`
5. Salvar metadados em `pantone_visual_db.json`

### Testar uma única imagem

Antes de processar toda a lista, você pode testar com uma cor específica:

```bash
python test_single_image.py "19-1663 TCX" "Ribbon Red"
```

Isso vai baixar apenas essa imagem e você pode verificar se a qualidade está adequada.

### Opções adicionais

```bash
# Também extrair e salvar a cor HEX dominante (opcional)
python generate_visual_db.py minha_tabela.csv --extract-hex
```

## 📊 Formato do CSV

O CSV deve ter pelo menos uma coluna com os códigos Pantone. Colunas reconhecidas automaticamente:

- **Código**: Coluna com "TCX" ou "CODE" no nome (ex: "TCX CODE")
- **Nome**: Coluna chamada "NAME" (opcional)
- **Link**: Coluna com "LINK" ou "URL" no nome (opcional, se já tiver URLs)

Exemplo:
```csv
TCX CODE,NAME,HEX
11-0103 TCX,Egret,
11-0104 TCX,Vanilla Ice,
19-1663 TCX,Ribbon Red,
```

## 📸 Formato das Imagens Baixadas

As imagens são salvas com o formato:
```
CODIGO_PANTONE_Nome_Cor.jpg
```

Exemplo: `19-1663_TCX_Ribbon_Red.jpg`

Todas as imagens são salvas na pasta `pantone_images/` em alta resolução (geralmente 1024x1024px ou 2048x2048px, dependendo do que estiver disponível no site).

## 💾 Metadados (JSON)

O arquivo `pantone_visual_db.json` contém informações sobre cada cor processada:

```json
{
    "19-1663 TCX": {
        "name": "Ribbon Red",
        "imageSaved": true,
        "imagePath": "pantone_images/19-1663_TCX_Ribbon_Red.jpg",
        "originalLink": "https://columbiaomnistudio.com/.../imagem_2048x2048.jpg",
        "visualHex": "#a12345"  // Se --extract-hex foi usado
    }
}
```

## ⚙️ Funcionalidades

### ✅ Recursos Implementados

- ✅ Busca automática de URLs de alta resolução no Shopify
- ✅ Download e salvamento de imagens em alta qualidade
- ✅ Nomenclatura automática baseada no código Pantone
- ✅ Resumo de processamento (salva progresso a cada 10 itens)
- ✅ Detecção automática de colunas no CSV
- ✅ Tratamento de erros e retomada de processamento
- ✅ Rate limiting para evitar bloqueios do servidor

### 🔍 Como Funciona a Busca de Alta Resolução

O script utiliza múltiplas estratégias para encontrar a imagem em maior resolução:

1. **Busca por padrões Shopify**: Procura por URLs com padrões como `_2048x2048`, `_1024x1024`, `_master`, `_zoom`
2. **Análise de tags img**: Verifica todas as tags `<img>` e seus atributos `srcset` para encontrar a maior resolução
3. **Modificação de og:image**: Se necessário, tenta modificar a URL da meta tag og:image para versões de alta resolução

## 🛠️ Troubleshooting

### Imagem não encontrada

Se uma imagem não for encontrada, o script continuará processando as demais. Você pode:
- Verificar se o código Pantone está correto no CSV
- Testar manualmente no site: `https://columbiaomnistudio.com/search?q=CODIGO`
- Re-executar o script (ele pula imagens já baixadas)

### Qualidade da imagem insuficiente

Se a imagem baixada não estiver em alta resolução suficiente:
- Verifique manualmente a URL original no site
- O site pode ter mudado a estrutura
- Algumas cores podem não ter versão zoom disponível

### Erro de conexão

O script inclui delays entre requisições para evitar bloqueios. Se ainda assim houver problemas:
- Verifique sua conexão com a internet
- Tente aumentar os delays no código (variável `time.sleep()`)
- Execute novamente (o script resume de onde parou)

## 📝 Notas Importantes

- ⚠️ **Rate Limiting**: O script inclui delays de 1 segundo entre requisições para ser respeitoso com o servidor
- 📦 **Progresso**: O progresso é salvo a cada 10 itens processados, então você pode interromper e continuar depois
- 🔄 **Retomada**: Se executar novamente, o script automaticamente pula cores já processadas
- 💾 **Espaço em disco**: Certifique-se de ter espaço suficiente (cada imagem pode ter 1-5MB)

## 📄 Licença

Este projeto é para uso pessoal/profissional. Respeite os termos de uso do site Columbia Omni Studio ao utilizar este script.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Se encontrar problemas ou tiver ideias, sinta-se à vontade para contribuir.

