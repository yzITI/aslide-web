<script setup>
import { watch } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import CodeMirror from '../components/CodeMirror.vue'
let markdown = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) {
    markdown = msg.slide.data?.markdown || ''
  }
})

watch($$(markdown), debounce(() => {
  sendOut({ slide: { data: { markdown } } })
}))
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2">Markdown Slide Editor</h2>
    <CodeMirror v-model="markdown" class="bg-white" language="markdown" />
  </div>
</template>
