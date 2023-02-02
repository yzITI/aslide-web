<script setup>
import { onMounted } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
let el = $ref()
let editor = null
window.katex = katex

onMounted(() => {
  editor = new Quill(el, {
    modules: {
      toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        [ 'bold', 'italic', 'underline', 'strike'],
        [{ 'align': [] }, { 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [ 'link', 'formula' ],
        [ 'clean' ],
      ]
    },
    theme: 'snow',
    placeholder: 'Write your content here!'
  })
  editor.on('text-change', debounce(() => {
    const content = editor.getContents()
    sendOut({ slide: { data: { content } } })
  }))
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
.ql-toolbar {
  position: sticky;
}
.ql-container {
  flex-grow: 1;
  height: 0;
  font-size: 1rem;
}
</style>
