Guia de deploy — Greicin Ateliê

Opções rápidas:

1) Netlify (recomendado)

- Conectar via GitHub (recomendado):
  1. Crie um repositório no GitHub e suba o projeto.
  2. No Netlify, clique em "New site from Git" → escolha GitHub → selecione o repositório → deploy.
  3. Em "Build settings" defina `Publish directory` como `/` (ou deixe vazio se perguntar).

- Deploy via Netlify CLI (sem GitHub):

  ```bash
  npm install -g netlify-cli
  netlify login
  netlify init   # siga instruções para criar novo site ou conectar
  netlify deploy --prod --dir=.
  ```

2) GitHub Pages

- Opção simples (sem CI):
  1. Suba o projeto para o repositório GitHub (branch `main`).
  2. Em `Settings > Pages`, escolha `main` branch e `/ (root)` como fonte.
  3. Aguarde alguns minutos — o site ficará disponível em `https://<seu-usuario>.github.io/<repo>`.

- Opção com CI (automática):
  - Já incluí o workflow em `.github/workflows/deploy.yml` que publica o conteúdo da raiz quando houver push para `main`.
  - Observação: o `GITHUB_TOKEN` padrão é suficiente para a maioria dos casos.

Comandos Git básicos (local):

```bash
# inicializar git caso não exista
git init
git add .
git commit -m "Site Greicin Ateliê - publicação"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

Notas:
- Se usar domínio próprio, configure DNS e adicione `CNAME` no repositório (arquivo `CNAME` com o domínio na raiz) ou configure via Netlify.
- Para mudanças posteriores, basta commitar e dar push — Netlify e o workflow do GitHub Pages farão deploy automático.
