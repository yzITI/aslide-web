<script setup>
import { watch } from 'vue'
import * as view from '../utils/peerView.js'
import state from '../state.js'
import { sendIn, setListener } from '../utils/iframe.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

let iframe = $ref(), info = $ref({}), slide = $ref(null)

function init () {
  view.start()
  info = {}
}
init()

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function connect () {
  state.loading = 'Connecting...'
  view.connect(id)
}
connect()

watch(() => view.state.peer, v => {
  state.loading = v ? 'Waiting for host' : 'Connecting...'
})

watch(() => view.state.slide, async v => {
  if (!v) return state.loading = 'Waiting for host'
  state.loading = false
  if (info.index === v.index) { // same slide
    sendIn({ slide: view.state.slide, session: view.state.id }, iframe)
  } else { // different slide
    slide = false
    info.index = v.index
    view.session(info)
    await sleep(300)
  }
  slide = v
})

setListener(msg => { // iframe msg
  if (msg.ready) sendIn({ slide: view.state.slide, session: view.state.id }, iframe)
  if (msg.response) view.response(msg.response)
})
</script>

<template>
  <div class="w-screen h-screen all-transition" :class="slide ? 'opacity-100' : 'opacity-0'">
    <iframe v-if="slide" class="w-full h-full" ref="iframe" :src="slide.surl" :key="String(slide.index + slide.surl)" sandbox="allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-same-origin allow-scripts" />
  </div>
</template>