# Yichun Liu — Portfolio

A React + Vite rebuild of the Webflow portfolio site (yichun-liu---senior-product-designer.webflow.io), with no Webflow dependency.

## Structure

- `src/pages` — Home, About, and the dynamic CaseStudy page (`/case-studies/:slug`)
- `src/data` — one JSON file per case study, plus `site.json` for shared nav/home/about copy
- `src/components` — Nav, Footer, ContactCta, Tag
- `src/components/falling-tools` — the physics-based falling icon/tag animation in the hero
  (uses `matter-js`; see `falling-tools/tools.js` to add/remove items)
- `public/images` — all image/GIF assets, downloaded from the original site

Two case studies (**Lending Solutions Redesign** and **Otis Digital Eco-system**) were password-protected
on the original site, so their content wasn't available to copy — those pages render a "protected" state
instead, matching the original site's behavior. Set `"protected": true` to `false` and fill in the rest of
the fields in their JSON files (see `unified-customer-hub.json` for the shape) if you get the content later.

## Commands

```bash
npm install
npm run dev      # start local dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Deploying

`npm run build` produces a static `dist/` folder — deploy it anywhere that serves static files
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.). Since this uses client-side routing
(react-router), configure your host to redirect all paths to `index.html` (a "SPA fallback").
