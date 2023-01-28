<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
let html = $ref('')
sendOut({ ready: 1 })

setListener(msg => {
  if (msg.slide) html = msg.slide.data?.html || ''
})
</script>

<template>
  <div class="w-full h-full" v-html="html" />
</template>