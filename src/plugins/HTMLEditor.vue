<script setup>
import { watch } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import CodeMirror from '../components/CodeMirror.vue'
const templates = {
  'Cover': '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; box-sizing: border-box;">\n  <h1 style="font-size: 3rem;">Hello, world!</h1>\n  <p style="color: #555; font-size: 2rem;">This is an HTML slide!</p>\n</div>\n',
  'Content': '<div style="height: 100%; display: flex; flex-direction: column; padding: 2rem; box-sizing: border-box;">\n  <h1 style="font-size: 2.5rem;">Title</h1>\n  <p style="color: #333; font-size: 1.8rem;">1. First...</p>\n  <p style="color: #333; font-size: 1.8rem;">2. Second...</p>\n  <p style="color: #333; font-size: 1.8rem;">3. Third...</p>\n</div>\n',
  'Code': `<div style="height: 100%; display: flex; flex-direction: column; padding: 2rem; box-sizing: border-box;">\n  <h1 style="font-size: 2.5rem;">Title</h1>\n<pre><code class="language-js">// this is a code block!\nconsole.log('Hello, world!')\n</code></pre>\n</div>\n\n\x3C!-- highlight.js dependency -->\n<link rel="stylesheet" href="../lib/monokai-sublime.min.css">\n\x3Cscript src="../lib/highlight.min.js">\x3C/script>\n\x3Cscript src="../lib/highlightjs-line-numbers.min.js">\x3C/script>\n\x3Cscript>function sleep (ms) { return new Promise(r => setTimeout(r, ms)) }; (async () => { while (1) { if (window.hljs && hljs.initLineNumbersOnLoad) { hljs.highlightAll(); hljs.initLineNumbersOnLoad(); break } else await sleep(500) } })()\x3C/script>\n<style>.hljs-ln-numbers { user-select: none; color: #ccc; border-right: 1px solid #CCC; padding-right: 5px !important; }\n.hljs-ln-code { padding-left: 10px !important; }</style>`
}
let html = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) {
    html = msg.slide.data?.html || ''
  }
})

watch($$(html), debounce(v => {
  sendOut({ slide: { data: { html } } })
}))
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2">HTML Slide Editor</h2>
    <div class="flex items-center flex-wrap text-sm">
      Templates:
      <button class="bg-blue-100 text-blue-500 font-bold px-2 rounded m-2 mr-0" v-for="(v, t) in templates" @click="html = v">{{ t }}</button>
    </div>
    <CodeMirror v-model="html" class="bg-white" />
  </div>
</template>