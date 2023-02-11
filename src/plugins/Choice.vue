<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
sendOut({ ready: 1 })

let html = $ref(''), options = $ref([])

setListener(msg => {
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = data.html
    options = data.options || []
  }
})

function response (key) {
  sendOut({ response: key })
}
</script>

<template>
  This is Choice Slide
  <div v-for="o in options" @click="response(o.key)">
    {{ o.text }}
    {{ o.ratio || '' }}
  </div>
</template>