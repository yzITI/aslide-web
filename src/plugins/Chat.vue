<script setup>
import { nextTick } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref([]), resp = $ref('')
let scroll = $ref()

let ok = $computed(() => resp.match(/\S/))

setListener(async msg => { // listen from ASlide
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = data.html
  }
  if (msg.message) {
    chat.push({ content: msg.message })
    await nextTick()
    scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

async function response() {
  if (!ok) return
  sendOut({ response: resp })
  chat.push({ content: resp, self: true })
  await nextTick()
  scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
  resp = ''
}
</script>

<template>
  <div class="w-full h-full bg-gray-500">
    <div class="w-full max-w-screen-md mx-auto h-full flex flex-col justify-center bg-gray-100 shadow-md">
      <div v-if="html" class="shadow w-full p-2 bg-white" v-html="html"></div>
      <div class="flex flex-col items-end w-full grow overflow-y-auto p-4">
        <template v-for="msg in chat">
          <div class="m-1 p-1 px-2 border rounded-lg break-all w-fit max-w-[80%]" :class="msg.self ? 'bg-white' : 'bg-sky-600 text-white self-start'">{{ msg.content }}</div>
        </template>
        <div ref="scroll"></div>
      </div>
      <div class="flex">
        <input class="m-2 mr-0 p-2 grow" placeholder="Send message to Host" v-model="resp" @keyup.enter="response">
        <button @click="response" class="w-18 p-2 px-3 font-bold shadow all-transition hover:shadow-md rounded text-white m-2" :class="ok ? 'bg-sky-500' : 'bg-gray-500'"><PaperAirplaneIcon class="w-5"/></button>
      </div>
    </div>
  </div>
</template>