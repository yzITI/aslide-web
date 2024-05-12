<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SS, state } from '../state.js'
const router = useRouter()
let channel = $ref('')

let show = $ref(true)
state.loading = false
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function goto () {
  show = false
  await sleep(300)
  router.push('/view/' + channel)
}

let fileInput = $ref(), channelInput = $ref()

function upload (f) {
  if (!f.name.match(/\.aslide$/)) return
  const reader = new FileReader()
  reader.addEventListener('load', e => {
    const value = e.target.result
    const value_latin1 = atob(value)
    const json = new TextDecoder('utf-8').decode(Uint8Array.from({ length: value_latin1.length }, (element, index) => value_latin1.charCodeAt(index)))
    SS.local = JSON.stringify({ title: f.name.replace(/\.aslide$/, ''), slides: JSON.parse(json) })
    router.push('/host/local')
  })
  reader.readAsText(f)
  fileInput.value = ''
}

function dropFile (e) {
  upload(e.dataTransfer.files[0])
}

function create () {
  SS.local = JSON.stringify({ title: 'Untitled', slides: [] })
  router.push('/host/local')
}

onMounted(() => channelInput?.focus())
</script>

<template>
  <div class="m-auto min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-300 to-green-200 all-transition" :class="show ? 'opacity-100' : 'opacity-0'" @drop.prevent="dropFile" @dragenter.prevent @dragover.prevent> 
    <h1 class="text-7xl sm:text-8xl uppercase font-[700] bg-gradient-to-r from-green-500 to-blue-600 inline-block bg-clip-text text-transparent drop-shadow-md select-none">ASlide</h1>
    <input type="file" class="hidden" ref="fileInput" @change="upload(fileInput.files[0])">
    <input class="w-72 mt-10 mb-4 rounded px-3 py-2 radius-2 all-transition font-mono font-bold text-xl text-center opacity-60 focus:opacity-100" ref="channelInput"
      placeholder="Enter Channel ID"
      @keyup.enter="goto"
      v-model="channel">
    <div class="fixed top-2 right-2 flex flex-col items-end">
      <p class="text-xs opacity-60">Drag and drop ASlide file to host a channel!</p>
      <button class="px-2 py-1 m-1 rounded bg-blue-500 text-white font-bold all-transition opacity-60 hover:opacity-100" @click="create">Create ASlide</button>
    </div>
  </div>
</template>
