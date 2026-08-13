# Greicin Ateliê — site em VSCode

## Como abrir
1. Extraia o ZIP.
2. Abra a pasta `greicin-atelie-site` no VSCode.
3. Instale a extensão **Live Server** (opcional).
4. Abra `index.html` com **Open with Live Server**.
5. O site abrirá no navegador, normalmente em `http://127.0.0.1:5500`.

## Estrutura
- `index.html` — página principal e menu.
- `css/style.css` — identidade visual, responsividade e componentes.
- `js/main.js` — menu mobile, filtros do catálogo, modal de produto e formulário.
- `assets/` — logos fornecidos nos anexos.

## Personalização
- Para trocar imagens reais dos produtos, coloque os arquivos em `assets/` e altere os blocos `.product-thumb`/`.product-visual` no `index.html`.
- Para publicar o formulário, substitua o comportamento do `#quote-form` por Google Forms, Formspree, backend próprio ou CRM.
- O catálogo já possui filtros por material e botões de solicitação de personalização.

## Upload integrations

Two upload strategies are scaffolded:

- Cloudinary (client-side unsigned uploads): set meta tags in `index.html` head:
	- `<meta name="upload-strategy" content="cloudinary">`
	- `<meta name="cloudinary-cloud-name" content="YOUR_CLOUD_NAME">`
	- `<meta name="cloudinary-upload-preset" content="YOUR_UNSIGNED_PRESET">`

- Netlify Function + S3 (signed uploads): a function scaffold exists at `netlify/functions/get-presigned.js`.
	- Install dependencies: `npm install` (adds AWS SDK v3 packages).
	- Set Netlify environment variables: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`.
	- Set `<meta name="upload-strategy" content="signed">` in `index.html` to use presigned flow.

Notes: client-side code will fallback to simulated uploads if configuration is missing.
