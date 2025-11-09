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
4. The build uses the repository name as the base path (`https://<user>.github.io/<repo>/`). If you use a custom domain or a different publishing path, set the `BASE_URL` environment variable in the workflow accordingly.

You can trigger the deployment manually from the **Actions** tab by running the “Deploy to GitHub Pages” workflow (`workflow_dispatch`).
