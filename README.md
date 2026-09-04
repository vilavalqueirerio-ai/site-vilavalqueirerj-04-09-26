# Vila Valqueire RJ - Publicidade & Serviços

Site profissional de publicidade e serviços para **empresas e pessoas físicas** da
Vila Valqueire, Rio de Janeiro. Propriedade de **JSMuniz Publicidade**.

Dominio: `www.vilavalqueirerj.com.br` • Instagram: `@vilavalqueirerj` • WhatsApp: (21) 2453-4420

## Estrutura

```
/
|-- index.html                  - Página principal
|-- admin/                      - PAINEL DE ADMINISTRAÇÃO (acesso restrito)
|   |-- index.html              -   Página de login (jsmunize / jojo7811)
|   |-- dashboard.html          -   Painel: Cores, Slider e Banner
|   |-- css/admin.css
|   |-- js/admin.js
|-- css/style.css               - Estilos (paleta gradiente Instagram)
|-- js/config.js                - CONFIGURACAO: WhatsApp, e-mail, Instagram, lat/long do clima, ID do AdSense
|-- js/site-defaults.js         - Valores padrão (fallback do site e do admin)
|-- js/main.js                  - Interatividade + aplica configurações do painel
|-- functions/_defaults.js      - Padrões e utilitários das funções
|-- functions/api/settings.js   - GET /api/settings (leituras públicas: site + admin)
|-- functions/api/admin/auth.js - POST /api/admin/auth (valida login)
|-- functions/api/admin/settings.js - POST /api/admin/settings (salva, com autenticação)
|-- functions/instagram.js      - /api/instagram (feed sincronizado)
|-- ads.txt                     - Google AdSense
|-- robots.txt                  - SEO
|-- sitemap.xml                 - SEO
```

## 1. Publicar via GitHub + Cloudflare Pages (recomendado)

Este método faz o Cloudflare rodar as **functions** automaticamente.

1. Crie um repositório no **GitHub** (de preferência **privado**).
2. Envie os arquivos desta pasta para o repositório (pode usar o GitHub Desktop ou:
   ```
   git init
   git add .
   git commit -m "Site Vila Valqueire RJ"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git push -u origin main
   ```
3. No **Cloudflare**: Workers & Pages → **Create application** → aba **Pages** →
   **Connect to Git** → se conecte ao GitHub → escolha o repositório.
4. Configuração do build:
   - **Production branch:** `main`
   - **Build command:** *(deixe vazio)*
   - **Output directory:** `/`
5. Clique em **Save and Deploy**. Aguarde o primeiro deploy.
6. Adicione o domínio em **Custom domains** → `vilavalqueirerj.com.br` (Cloudflare cria o DNS).

> As functions da pasta `functions/` são detectadas automaticamente em deploys via Git.

## 2. Painel de administração

Acesse `https://www.vilavalqueirerj.com.br/admin/`

- **Login:** `jsmunize` • **Senha:** `jojo7811`
- No painel você edita: **Cores** (fundo e gradiente), **Slider de publicidade** e **Banner**.
- As alterações são salvas no **Cloudflare KV** e valem para todos os visitantes.

### 2.1 Criar o Cloudflare KV (obrigatório para salvar)

1. No Cloudflare: **Workers & Pages → KV → Create namespace** → nome: `vv-settings`.
2. No projeto Pages: **Settings → Bindings → Add binding → KV namespace** →
   nome da variável `SETTINGS` → selecione `vv-settings` → **Save**.

Se o binding não existir, o site continua funcionando com os valores padrão, mas
o painel mostra "binding KV não configurado" ao salvar.

### 2.2 Trocar usuário/senha do admin (recomendado)

1. No projeto Pages: **Settings → Environment variables → Add**:
   - `ADMIN_USER` = novo usuário
   - `ADMIN_PASS` = nova senha (use *Encrypt* para proteger)
2. Publique/faça um novo deploy. Os valores do código deixam de valer.

> Por segurança: mantenha o repositório do GitHub **privado** e use senha forte.

## 3. Feed do Instagram (Graph API)

1. Conta do Instagram em modo **Profissional (Business ou Criador)**.
2. App em https://developers.facebook.com (produto *Instagram*, permissão `instagram_business_basic`).
3. Gere o token de longa duração e descubra seu **Instagram User ID**.
4. No projeto Pages: **Settings → Environment variables → Add**:
   - `INSTAGRAM_TOKEN` = seu token
   - `INSTAGRAM_USER_ID` = seu ID numérico
5. O site mostra as últimas 12 postagens (atualização a cada 5 min).

Sem as variáveis, o site exibe um cartão com o botão "Seguir @vilavalqueirerj".

> Tokens Graph API expiram (~60 dias). Renove e atualize a variável quando precisar.

## 4. Google AdSense

1. Cadastre `www.vilavalqueirerj.com.br` no Google AdSense.
2. Substitua **todas** as ocorrências de `ca-pub-XXXXXXXXXXXXXXXX` em `index.html`
   e no `js/config.js`.
3. Preencha o `ads.txt` se solicitado (formato já preparado).

Espaços prontos: slider de publicidade (venda direta), banner AdSense responsivo e
banner fixo no rodapé com botão de fechar.

## 5. Edição rápida

- Dados de contato (WhatsApp, e-mail, telefone, Instagram): `js/config.js`
- Textos (serviços, planos, depoimentos): `index.html`
- Cores, slider e banner: pelo **painel admin** (`/admin/`)

---

© 2026 Vila Valqueire RJ — Propriedade de JSMuniz Publicidade. Todos os direitos reservados.