<script setup>
import { debounce } from '../utils/utils.js'
import parse from '../utils/parse.js'
import { watch, nextTick } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref([]), sessions = $ref({})

let target = $ref(''), msg = $ref(''), thread = $ref('')
let ok = $computed(() => msg.match(/\S/))
let scroll = $ref()

let displayChat = $computed(() => chat.filter(x => !thread || !x.target || x.target === thread))

async function refresh () {
  await nextTick()
  scroll.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

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
      chat.push({ content: msg.responses[k], html: parse(msg.responses[k]), target: k, label: sessions[k]?.name || 'Anonymous' })
    }
    refresh()
  }
})

async function send () {
  if (!ok) return
  const payload = {}
  if (!target) {
    for (const k in sessions) payload[k] = msg
  } else payload[target] = msg
  sendOut({ messages: payload })
  chat.push({ content: msg, html: parse(msg), self: true, target, label: 'To ' + (target ? sessions[target]?.name : 'All') })
  refresh()
  msg = ''
}

watch($$(html), debounce(v => {
  sendOut({ slide: { data: { html } } })
}))

watch($$(thread), refresh)
</script>

<template>
  <div class="p-2 relative h-full">
    <div class="w-full h-full flex flex-col justify-center">
      <textarea v-model="html" rows="1" placeholder="Chat Prompt" class="p-1 px-2 shrink-0 relative border border-blue-500 rounded bg-blue-100"></textarea>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          Thread:
          <select v-model="thread" class="m-2 mr-0 rounded p-1 max-w-[8rem] all-transition bg-white border" :class="thread && 'ring'">
            <option value="">All</option>
            <option v-for="(s, id) in sessions" :value="id">{{ s.name || 'Anonymous' }}</option>
          </select>
          <span class="text-gray-500 text-xs mx-2">double click message to view the thread.</span>
        </div>
        <button class="bg-red-500 text-white font-bold text-sm shadow px-2 py-1 rounded" @click="chat = []">Clear</button>
      </div>
      <div class="flex flex-col items-end w-full grow overflow-y-auto scrollbar p-4 pb-0">
        <template v-for="msg in displayChat">
          <div class="text-xs text-gray-500 cursor-pointer mt-1 mx-2" :class="msg.self ? '' : 'self-start'" @click="target = msg.target" @dblclick="thread = msg.target">{{ msg.label }}</div>
          <div class="mb-1 mx-1 p-1 px-2 border rounded-lg break-words w-fit max-w-[80%] cursor-pointer" :class="msg.self ? 'bg-white' : 'bg-sky-600 text-white self-start'" @click="target = msg.target" @dblclick="thread = msg.target" v-html="msg.html"></div>
        </template>
        <div ref="scroll" class="mt-4"></div>
      </div>
      <div class="flex">
        <select v-model="target" class="m-2 mr-0 rounded p-1 max-w-[6rem] all-transition bg-white border" :class="target && 'ring'">
          <option value="">All</option>
          <option v-for="(s, id) in sessions" :value="id">{{ s.name || 'Anonymous' }}</option>
        </select>
        <input class="m-2 mr-0 p-2 grow" :placeholder="'Send message to ' + (target ? (sessions[target]?.name || 'Anonymous') : 'All')" v-model="msg" @keyup.enter="send">
        <button @click="send" class="w-18 p-2 px-3 font-bold shadow all-transition hover:shadow-md rounded text-white m-2" :class="ok ? 'bg-sky-500' : 'bg-gray-500'"><PaperAirplaneIcon class="w-5"/></button>
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
