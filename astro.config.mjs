// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Static output for Cloudflare Pages. Switch `site` when a custom domain is chosen.
// React is only for islands (copied-in components from 21st.dev, shadcn, React Bits,
// Canvas UI); everything else stays zero-JS Astro.
export default defineConfig({
  site: 'https://sourasishbasu.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
