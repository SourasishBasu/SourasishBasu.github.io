// @ts-check
import { defineConfig, envField } from 'astro/config';
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
  // Film disc art is fetched and cropped at build time, then served from the site.
  image: { domains: ['a.ltrbxd.com', 'assets.fanart.tv', 'image.tmdb.org'] },
  env: {
    schema: {
      // Optional: a fanart.tv project key, for real disc art where it exists. Build-time only.
      FANART_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Optional: a TMDB API Read Access Token, for textless posters (key art) on discs without disc art. Build-time only.
      TMDB_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: { plugins: [tailwindcss()] },
});
