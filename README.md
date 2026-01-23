# Extrator de Imagens Pantone TCX em Alta Resolução

Este projeto baixa imagens em alta resolução das cores Pantone Fashion, Home + Interiors (TCX - Cotton) do site Columbia Omni Studio. As imagens capturam a textura do tecido e são essenciais para garantir fidelidade de cor na produção têxtil.

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

