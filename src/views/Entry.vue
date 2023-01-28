<script setup>
import { useRouter } from 'vue-router'
import state from '../state.js'
const router = useRouter()
let channel = $ref('')

let show = $ref(true)
state.loading = false
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function goto () {
  show = false
  await sleep(300)
  router.push('/@/' + channel)
}
</script>

<template>
  <div class="m-auto min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-300 to-green-200 all-transition" :class="show ? 'opacity-100' : 'opacity-0'"> 
    <h1 class="text-8xl uppercase font-[700] bg-gradient-to-r from-green-500 to-blue-600 inline-block bg-clip-text text-transparent">Aslide</h1> 
    <input class="w-72 mt-10 mb-4 rounded px-3 py-2 radius-2 all-transition font-mono font-bold text-xl text-center opacity-60 focus:opacity-100"
      placeholder="Enter Channel ID"
      @keyup.enter="goto"
      v-model="channel">
  </div>
</template>
