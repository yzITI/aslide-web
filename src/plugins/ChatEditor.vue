<script setup>
import { debounce } from '../utils/utils.js'
import { watch, nextTick } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref([]), sessions = $ref({})

let target = $ref(''), msg = $ref('')
let ok = $computed(() => msg.match(/\S/))
let scroll = $ref()

setListener(async msg => {
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = typeof data.html === 'undefined' ? 'This is chat prompt, and it supports HTML.' : data.html
  }
  if (msg.sessions) {
    for (const k in msg.sessions) {
      if (msg.sessions[k]) sessions[k] = msg.sessions[k]
      else delete sessions[k]
    }
  }
  if (msg.responses) {
    for (const k in msg.responses) {
      chat.push({ content: msg.responses[k], target: k, label: sessions[k]?.name || 'Anonymous' })
    }
    await nextTick()
    scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

async function send () {
  if (!ok) return
  const payload = {}
  if (!target) {
    for (const k in sessions) payload[k] = msg
  } else payload[target] = msg
  sendOut({ messages: payload })
  chat.push({ content: msg, self: true, target, label: target ? sessions[target]?.name : 'All' })
  await nextTick()
  scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
  msg = ''
}

watch($$(html), debounce(v => {
  sendOut({ slide: { data: { html } } })
}))
</script>

<template>
  <div class="p-2 relative h-full">
    <div class="w-full h-full flex flex-col justify-center">
      <textarea v-model="html" rows="1" placeholder="Chat Prompt" class="rounded p-1 shadow px-2"></textarea>
      <div class="flex flex-col items-end w-full grow overflow-y-auto p-4">
        <template v-for="msg in chat">
          <div class="text-xs text-gray-500 cursor-pointer mt-1 mx-2" :class="msg.self ? '' : 'self-start'" @click="target = msg.target">{{ msg.label }}</div>
          <div class="mb-1 mx-1 p-1 px-2 border rounded-lg break-all w-fit max-w-[80%] cursor-pointer" :class="msg.self ? 'bg-white' : 'bg-sky-600 text-white self-start'" @click="target = msg.target">{{ msg.content }}</div>
        </template>
        <div ref="scroll"></div>
      </div>
      <div class="flex">
        <select v-model="target" class="m-2 mr-0 rounded p-1 max-w-[6rem]">
          <option value="">All</option>
          <option v-for="(s, id) in sessions" :value="id">{{ s.name || 'Anonymous' }}</option>
        </select>
        <input class="m-2 mr-0 p-2 grow" :placeholder="'Send message to ' + (target ? (sessions[target]?.name || 'Anonymous') : 'All')" v-model="msg" @keyup.enter="send">
        <button @click="send" class="w-18 p-2 px-3 font-bold shadow all-transition hover:shadow-md rounded text-white m-2" :class="ok ? 'bg-sky-500' : 'bg-gray-500'"><PaperAirplaneIcon class="w-5"/></button>
      </div>
    </div>
  </div>
</template>
