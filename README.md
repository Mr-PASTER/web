# PASTER ECO SYSTEM – Web Application

React + Vite web client for the PASTER ECO SYSTEM platform.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `src/` – Application source code
- `public/` – Static assets served as-is
- `dist/` – Production build output (created by `npm run build`)

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) – SPA tooling
- [TypeScript](https://www.typescriptlang.org/) – Type safety
- [Tailwind CSS](https://tailwindcss.com/) – Styling

## GitHub Pages Deployment

1. Make sure the default branch is `main` and all changes are pushed.
2. In **Settings → Pages**, select **Source → GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` will build the app on every push to `main` and publish it to GitHub Pages.
4. The workflow automatically sets the base path: `/` for `user.github.io` repos, or `/<repo>/` for project pages (e.g. `https://<user>.github.io/<repo>/`). Override `BASE_URL` in the workflow if you serve from a custom path/domain.
5. The workflow copies `index.html` to `404.html`, so client-side routes keep working on refresh. GitHub Pages will handle history API fallbacks out of the box.

You can trigger the deployment manually from the **Actions** tab by running the “Deploy to GitHub Pages” workflow (`workflow_dispatch`).
