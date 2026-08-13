# Testes e Capturas

Este arquivo descreve como capturar screenshots responsivas e como testar os fluxos de upload (Cloudinary e S3 presigned).

## Capturar screenshots responsivas

Requisitos:
- Node.js (>=14)
- `puppeteer` (instalar localmente)

Comandos:

```powershell
npm install puppeteer
node scripts/capture-screenshots.js
# ou com URL customizada:
SITE_URL=https://greicin-atelie-site.netlify.app node scripts/capture-screenshots.js
```

As screenshots serão salvas em `screenshots/desktop.png`, `screenshots/tablet.png` e `screenshots/mobile.png`.

## Testar Cloudinary (end-to-end)

1. No site de produção abra o painel de debug (`#upload-debug`) ou edite `index.html` para ajustar os meta tags:
   - `meta[name="cloudinary-cloud-name"]` → seu `cloud name`
   - `meta[name="cloudinary-upload-preset"]` → seu unsigned `upload preset`
2. No painel de debug selecione `strategy: cloudinary`.
3. Use o uploader por produto e tente enviar uma imagem.

Observação: Cloudinary unsigned uploads não exigem chaves no servidor.

## Testar S3 presigned (end-to-end)

Opção A — Em produção (Netlify):
- Defina as environment variables do Netlify no painel do site: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`.
- Redeploy no Netlify (ou `netlify env:set` e novo deploy). Depois selecione `strategy: signed` no painel de debug e faça upload.

Opção B — Local (dev):
- Pare o processo ocupando a porta usada por `netlify dev` (ex.: 3999). Em PowerShell:
```powershell
# encontra PID da porta 3999
(Get-NetTCPConnection -LocalPort 3999).OwningProcess
# mata o processo (substitua <PID>)
Stop-Process -Id <PID> -Force
```
- Rode `netlify dev` novamente (pode escolher `--port` se preferir).
- Abra `http://localhost:8888` (ou porta escolhida) e teste `strategy: signed` — a função `get-presigned` usará credenciais do ambiente local se definidas, ou caída para mock no código.

## Observações
- O endpoint de produção `/.netlify/functions/get-presigned` pode responder com um redirecionamento de login para chamadas sem JavaScript (curl/Invoke-RestMethod). Teste via navegador ou use `netlify dev` para chamadas locais.
