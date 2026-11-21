// @ts-check
import { defineConfig } from 'astro/config';

// Static output for Cloudflare Pages. Switch `site` when a custom domain is chosen.
export default defineConfig({
  site: 'https://sourasishbasu.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
