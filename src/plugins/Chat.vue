<script setup>
import { nextTick } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import parse from '../utils/parse.js'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
import { useRoute } from 'vue-router'
const route = useRoute()
const inverse = route.query.inverse // inverse color
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref([]), resp = $ref('')
let scroll = $ref()

let ok = $computed(() => resp.match(/\S/))

async function refresh () {
  await nextTick()
  scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

setListener(async msg => { // listen from ASlide
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = parse(data.html, false)
  }
  if (msg.message) {
    chat.push({ content: msg.message, html: parse(msg.message) })
    refresh()
  }
})

async function response() {
  if (!ok) return
  sendOut({ response: resp })
  chat.push({ content: resp, html: parse(resp), self: true })
  refresh()
  resp = ''
}
</script>

<template>
  <div class="w-screen h-screen fixed top-0 left-0 bg-gray-500">
    <div ref="container" class="w-full max-w-screen-md mx-auto h-full flex flex-col justify-center bg-gray-100 shadow-md">
      <div v-if="html" class="shadow w-full p-2 bg-white relative" v-html="html"></div>
      <div class="flex flex-col items-end w-full grow overflow-y-auto p-4 pb-0">
        <div v-for="(msg, i) in chat" :key="i" class="m-1 p-1 px-2 border rounded-lg break-all w-fit max-w-[80%]" :class="[(msg.self ? !inverse : inverse) ? 'bg-white' : 'bg-sky-600 text-white', msg.self || 'self-start']" v-html="msg.html"></div>
        <div ref="scroll" class="mt-4"></div>
      </div>
      <div class="flex">
        <input class="m-2 mr-0 p-2 grow" placeholder="Send message to Host" v-model="resp" @keyup.enter="response">
        <button @click="response" class="w-18 p-2 px-3 font-bold shadow all-transition hover:shadow-md rounded text-white m-2" :class="ok ? 'bg-sky-500' : 'bg-gray-500'"><PaperAirplaneIcon class="w-5"/></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
</style>
