<script setup>
import { onMounted } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
let el = $ref()
let editor = null
window.katex = katex

onMounted(() => {
  editor = new Quill(el, {
    modules: { toolbar: false },
    readOnly: true,
    theme: 'snow'
  })
  sendOut({ ready: 1 })
})

setListener(msg => {
  if (msg.slide) {
    const content = msg.slide.data?.content
    if (content && editor) {
      editor.setContents(content)
    }
  }
})
</script>

<template>
  <div class="w-full h-full flex flex-col bg-white">
    <div ref="el"></div>
  </div>
</template>

<style scoped>
.ql-container {
  flex-grow: 1;
  height: 0;
  font-size: 1rem;
}
</style>
