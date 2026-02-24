# TODO: Tirar aplicação local e rodar plugin Figma conectado ao Xano

Objetivo: deixar de depender da API local (Flask + SQLite) e ter o plugin Figma funcionando conectado ao Xano e ao motor de matching.

---

## Situação atual

| Componente | Hoje | Fonte de dados |
|------------|------|----------------|
| **Plugin Figma** | Chama `apiBase` (ex.: `http://127.0.0.1:5050`) | — |
| **API local (Flask)** | `/api/match` e `/api/match-image` | SQLite (`pantone_colors`) |
| **Xano** | GET/POST/PUT pantone_colors | Já configurado e testado |

O motor de matching (Delta E CIE2000 + extração de HEX por imagem) está no **Python**. O Xano não faz matching; só expõe o catálogo (e CRUD). Por isso o fluxo precisa manter um **serviço Python** que use o catálogo do Xano.

---

## Arquitetura alvo (resumo)

```
Figma Plugin  →  API Python (deploy)  →  Xano (GET pantone_colors para catálogo)
                     ↓
              Extração HEX + Delta E
              (continua em Python)
```

---

## TODO – Passo a passo

### Fase 1: API Python usa Xano como catálogo (ainda local)

- [ ] **1.1** Adicionar em `mvp_sql/mvp_api.py`:
  - Variável de ambiente `XANO_BASE_URL` (ex.: `https://xxx.xano.io/api:xxx`).
  - Função que chama `GET {XANO_BASE_URL}/pantone_colors` e retorna lista de cores (id, code, name, hex_code, swatch_img, etc.).
- [ ] **1.2** Trocar `compute_matches_from_input_lab` para usar essa lista do Xano em vez de SQLite:
  - Para cada item, converter `hex_code` → LAB (usar lógica já existente).
  - Calcular Delta E e ordenar; retornar top N.
  - Manter formato de resposta compatível com o plugin (code, name, extracted_hex, delta_e, similarity; swatch_img/url se quiser exibir no UI).
- [ ] **1.3** Ajustar resposta do match para incluir campos que o plugin usa (ex.: `swatch_img.url` do Xano para mostrar preview).
- [ ] **1.4** Manter `/api/match-image`: extração de HEX dominante em Python; em seguida usar o mesmo fluxo de match com catálogo vindo do Xano.
- [ ] **1.5** Testar localmente: API rodando com `XANO_BASE_URL` apontando para o Xano; plugin com API base `http://127.0.0.1:5050`. Validar match por HEX e por imagem.

**Critério de aceite:** Plugin no Figma, com API local rodando, retorna matches usando apenas dados do Xano (sem SQLite para catálogo).

---

### Fase 2: Deploy da API Python (plugin acessa via internet)

- [ ] **2.1** Escolher provedor (ex.: Railway, Render, Fly.io).
- [ ] **2.2** Criar projeto e configurar deploy do `mvp_sql` (Flask: `mvp_api.py`).
- [ ] **2.3** Definir variáveis de ambiente no provedor: `XANO_BASE_URL` (e API key do Xano se o GET for autenticado).
- [ ] **2.4** Garantir CORS no Flask para a origem do Figma (ou `*` em dev); já existe `add_cors_headers`.
- [ ] **2.5** Obter URL pública da API (ex.: `https://smartcolor-api.railway.app`).
- [ ] **2.6** No plugin: documentar ou pré-preencher a URL da API (campo "API base") com essa URL pública.
- [ ] **2.7** Testar no Figma: API base = URL pública; match por HEX e por imagem.

**Critério de aceite:** Plugin no Figma funciona com a API em produção, sem rodar nada na máquina do usuário.

---

### Fase 3: Plugin e documentação

- [ ] **3.1** Atualizar `mvp_figma_plugin/README.md` com:
  - Uso com API local (XANO_BASE_URL no .env).
  - Uso com API em produção (URL pública no campo API base).
- [ ] **3.2** (Opcional) Se quiser esconder a URL de produção: definir default do campo API base no plugin para a URL pública (ou carregar de um config).
- [ ] **3.3** Remover ou arquivar referências a “subir SQLite” como obrigatório; deixar claro que o catálogo vem do Xano.

**Critério de aceite:** Qualquer dev consegue rodar o plugin contra local ou produção seguindo o README.

---

## O que NÃO é necessário agora

- Implementar matching no Xano (continua no Python).
- Fazer o plugin chamar o Xano direto para match (plugin continua chamando a API Python).
- Endpoint de upload de imagem no Xano para o fluxo do plugin (upload é só para extrair HEX; o match usa a API Python + catálogo Xano).

---

## Ordem sugerida

1. Fase 1 (Python lê catálogo do Xano, tudo ainda local).
2. Testar bem no Figma com API local.
3. Fase 2 (deploy da API).
4. Fase 3 (docs e defaults do plugin).

---

## Resumo em uma frase

Trocar a leitura do catálogo de SQLite para GET Xano na API Python, fazer deploy dessa API e apontar o plugin Figma para essa URL para ficar “fora do local” e rodando conectado ao Xano.
