<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
sendOut({ ready: 1 })

let html = $ref(''), chat = $ref(''), person =$ref(''), responses = $ref(null)

setListener(msg => {
  console.log(msg)
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = typeof data.html === 'undefined' ? 'This is choice prompt, and it supports HTML.' : data.html
    options = data.options || []
  }
  if (msg.sessions) sessions = msg.sessions
  if (msg.responses) responses = msg.responses
})

function sendchat(content) {
  sendOut()
}
console.log(responses)
</script>

<template>
  hello
  <div>{{ responses }}</div>
</template>
