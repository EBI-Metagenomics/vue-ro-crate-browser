import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'index.ts',
      name: 'VueRoCrateBrowser',
      fileName: (format) => `vue-ro-crate-browser.${format}.js`
    },
    rollupOptions: {
      // Ensure external dependencies are not bundled into the library
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
