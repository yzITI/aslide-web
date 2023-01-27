<script setup>
import ws from '../ws.js'
import state from '../state.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

let iframe = $ref(), info = $ref({})

let channel = $ref({ slide: null })
function initChannel () {
  channel.time = false // last message time, used to mark channel open
  channel.slide = null
}
initChannel()

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function join () {
  state.loading = 'Joining Channel'
  while (1) {
    if (ws.socket?.readyState === 1) break
    await sleep(1000)
  }
  ws.call('view.join', id)
}
if (ws.session) join()

ws.handle = msg => {
  console.log(msg)
  if (msg.session) {
    initChannel()
    join()
    return
  }
  if (msg.alert) Swal.fire(msg.alert.title, msg.alert.html, msg.alert.icon)
  channel.time = Date.now()
  if (typeof msg.slide !== 'undefined') {
    channel.slide = msg.slide
    if (msg.slide && info.index !== msg.slide.index) {
      info.index = msg.slide.index
      ws.call('view.info', info)
    }
  }
  if (channel.slide) state.loading = false
  else state.loading = 'Waiting for Host'
}
</script>

<template>
  <Transition name="fade">
    <iframe v-if="channel.slide" class="w-screen h-screen" ref="iframe" :src="channel.slide.surl" />
  </Transition>
</template>