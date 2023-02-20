<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref(''), resp = $ref(null)

setListener(msg => { // listen from ASlide
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = data.html
    chat = data.chat 
  }
})

function response (content) {
  resp = content
  sendOut({ response: resp })
}
</script>

<template>
  <button @click="response(1)">123</button>
</template>