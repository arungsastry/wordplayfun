import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: '/wordplayfun/',
  server: {
    port: 3000,
    open: true
  }
});
