<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
let html = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) html = msg.slide.data?.html || ''
})

function submit () {
  sendOut({ slide: { data: { html }, surl: './#/@/html' } })
}
</script>

<template>
  <div class="p-2">
    <textarea class="block w-full" v-model="html"></textarea>
    <button class="block" @click="submit">Submit</button>
  </div>
</template>