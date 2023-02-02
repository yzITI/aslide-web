<script setup>
import { watch } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import CodeMirror from '../components/CodeMirror.vue'
const defaultValue = '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center;">\n  <h1 style="font-size: 3rem;">Hello, world!</h1>\n  <p style="color: #555; font-size: 2rem;">This is an HTML slide!</p>\n</div>\n'
let html = $ref(''), old = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) {
    html = msg.slide.data?.html || defaultValue
  }
})

watch($$(html), debounce(v => {
  sendOut({ slide: { data: { html } } })
}))
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2">HTML Slide Editor</h2>
    <CodeMirror v-model="html" class="bg-white" />
  </div>
</template>