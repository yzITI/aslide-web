<script setup>
import { sendOut, setListener } from '../utils/iframe.js'
sendOut({ ready: 1 })

let html = $ref(''), options = $ref([]), resp = $ref(null)

setListener(msg => {
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = data.html
    options = data.options || []
  }
})

function response (key) {
  resp = key
  sendOut({ response: resp })
}
</script>

<template>
  <div class="w-full h-full bg-gray-500">
    <div class="w-full max-w-screen-md mx-auto min-h-full flex flex-col justify-center align-center p-4 sm:p-10 bg-gray-100 shadow-md">
      <div class="border rounded-lg m-4 p-4 bg-white">
        <div v-html="html" />
      </div>
      <div class="h-10"></div>
      <div>
        <div v-for="o in options" @click="response(o.key)" class="font-bold py-2 px-4 m-2 border rounded overflow-hidden bg-white cursor-pointer all-transition relative text-gray-700" :class="resp === o.key && 'ring border-blue-500'">
          <div class="absolute left-0 top-0 bg-blue-100 h-full all-transition" :style="{ width: (resp && o.ratio || 0) * 100 + '%' }" />
          <span class="relative">{{ o.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>