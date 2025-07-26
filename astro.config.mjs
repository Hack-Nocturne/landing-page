// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://hack-nocturne.in';
const seoAssets = [
  `${site}/assets/participants-brochure-25.pdf`,
  `${site}/assets/sponsors-brochure-25.pdf`,
];

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  output: 'static',
  site,

  build: {
    inlineStylesheets: 'always',
  },

  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },

  integrations: [sitemap({
    customPages: seoAssets,
    changefreq: 'weekly',
    lastmod: new Date(),
  })],
});
