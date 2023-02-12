<script setup>
import ws from '../ws.js'
import state from '../state.js'
import { sendIn, setListener } from '../utils/iframe.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

let iframe = $ref(), info = $ref({}), show = $ref(true)

let channel = $ref({ slide: null })
function initChannel () {
  channel.time = false // last message time, used to mark channel open
  channel.slide = null
  info = {}
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

ws.handle = async msg => {
  if (msg.session) {
    initChannel()
    join()
    return
  }
  if (msg.alert) Swal.fire(msg.alert.title, msg.alert.html, msg.alert.icon)
  channel.time = Date.now()
  if (typeof msg.slide !== 'undefined') { // slide update
    if (msg.slide && info.index !== msg.slide.index) { // different slide
      show = false
      info.index = msg.slide.index
      ws.call('view.info', info)
      await sleep(300)
    }
    channel.slide = msg.slide
    document.title = channel.slide?.title || 'ASlide'
    sendIn({ slide: channel.slide }, iframe)
    await sleep(300)
    show = true
  }
  if (channel.slide) state.loading = false
  else state.loading = 'Waiting for Host'
}

setListener(msg => { // iframe msg
  if (msg.ready) sendIn({ slide: channel.slide, session: ws.session }, iframe)
  if (msg.response) ws.call('view.response', msg.response)
})
</script>

<template>
  <div class="w-screen h-screen all-transition" :class="show ? 'opacity-100' : 'opacity-0'">
    <iframe v-if="channel.slide" class="w-full h-full" ref="iframe" :src="channel.slide.surl" :key="String(channel.slide.index + channel.slide.surl)" sandbox="allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-same-origin allow-scripts" />
  </div>
</template>