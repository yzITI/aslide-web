import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import reactivityTransform from '@vue-macros/reactivity-transform/vite'

export default defineConfig({
  base: '',
  plugins: [vue(), reactivityTransform()]
})
