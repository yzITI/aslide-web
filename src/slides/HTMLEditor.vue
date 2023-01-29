<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
import CodeMirror from '../components/CodeMirror.vue'
const defaultValue = '<div style="height: 100%; display: flex; align-items: center; justify-content: center;">\n  <h1 style="font-size: 3rem; font-weight: bold;">Hello, world!</h1>\n</div>\n'
let html = $ref(defaultValue), old = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) {
    old = msg.slide.data?.html || ''
    html = old || defaultValue
  }
})

function submit () {
  if (old === html) return
  sendOut({ slide: { data: { html }, surl: './#/slide/html' } })
  old = html
}
</script>

<template>
  <div class="p-2 relative h-full">
    <div class="flex items-center justify-between my-2">
      <h2 class="font-bold text-lg">HTML Slide Editor</h2>
      <button class="text-white font-bold rounded shadow all-transition hover:shadow-md px-3 py-1" :class="old === html ? 'bg-gray-500' : 'bg-blue-500'" @click="submit">{{ old === html ? 'Up to date' : 'Update' }}</button>
    </div>
    <CodeMirror v-model="html" style="height: calc(100% - 4rem);"/>
  </div>
</template>