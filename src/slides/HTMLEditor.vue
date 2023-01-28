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
  <textarea v-model="html"></textarea>
  <button @click="submit">Submit</button>
</template>