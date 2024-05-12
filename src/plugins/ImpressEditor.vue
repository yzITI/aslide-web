<script setup>
import { watch } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import CodeMirror from '../components/CodeMirror.vue'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/vue/24/solid'
const template = '<style>\n  .step { width: 1024px; height: 768px; display: flex; flex-direction: column; justify-content: center; align-items: center; }</style>\n<div class="step" data-x="0" data-y="0">\n  <h1 style="font-size: 3rem;">ASlide Impress.js Plugin</h1>\n  <p style="font-size: 1.5rem;">You can build a Impress presentation inside ASlide!</p>\n</div>\n<div class="step" data-x="1200" data-y="0">\n  <h1 style="font-size: 3rem;">Another slide!</h1>\n</div>\n<div class="step" data-x="1200" data-y="900" data-rotate="180">\n  <h1 style="font-size: 3rem;">Yet another slide!</h1>\n</div>\n<div class="step" data-x="0" data-y="900" data-rotate="180">\n  <h1 style="font-size: 3rem;">Impress.js is an open-source framework</h1>\n</div>\n<div class="step" data-x="600" data-y="450" data-z="600" data-scale="2" data-rotate="180">\n  <h1 style="font-size: 3rem;">Presentation like Prezi!</h1>\n</div>\n<div class="step" data-x="600" data-y="450" data-z="300" data-rotate-x="90" data-rotate-z="180" data-scale="0.5">\n  <h1 style="font-size: 3rem; background: white;">And beyond...</h1>\n</div>'
let html = $ref(''), sessions = $ref({}), index = $ref(0)

sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) {
    html = msg.slide.data?.html || ''
  }
  if (msg.sessions) {
    for (const k in msg.sessions) {
      if (msg.sessions[k]) {
        sessions[k] = msg.sessions[k]
        sendOut({ messages: { [k]: { index } } })
      } else delete sessions[k]
    }
  }
})

watch($$(html), debounce(() => {
  sendOut({ slide: { data: { html } } })
}))

watch($$(index), debounce(() => {
  const messages = {}
  for (const k in sessions) messages[k] = { index }
  sendOut({ messages })
}))
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2">Impress Slide Editor</h2>
    <div class="flex items-center justify-between text-sm">
      <button class="bg-blue-100 text-blue-500 font-bold px-2 rounded m-2 mr-0" @click="html = template">Load Template</button>
      <div class="flex items-center">
        <ChevronLeftIcon @click="index--" class="w-5 mx-1 all-transition hover:scale-125 text-blue-500 cursor-pointer" :class="index < 1 && 'invisible'" />
        <input v-model="index" type="number" placeholder="index" class="w-12 rounded border pl-1 text-lg font-bold">
        <ChevronRightIcon @click="index++" class="w-5 mx-1 all-transition hover:scale-125 text-blue-500 cursor-pointer" />
      </div>
    </div>
    <CodeMirror v-model="html" class="bg-white" language="html" />
  </div>
</template>
