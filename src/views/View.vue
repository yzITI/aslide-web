<script setup>
import { watch } from 'vue'
import * as view from '../utils/peerView.js'
import state from '../state.js'
import { sendIn, setListener } from '../utils/iframe.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

let iframe = $ref(), show = $ref(false), slide = $ref(null)
let info = $ref({
  name: state.user?.name || route.query.name?.substring(0, 20) || '',
  on: document.visibilityState !== 'hidden'
})
state.user = null // logout for security
window.sessionStorage.removeItem('token')

state.loading = 'Connecting to host...'
view.start()
view.connect(id)

const sleep = ms => new Promise(r => setTimeout(r, ms))

watch(() => view.state.peer, v => {
  if (!v) return state.loading = 'Connecting to host...'
  state.loading = 'Waiting for slide...'
  view.session(info)
})

watch(() => view.state.slide, async v => {
  if (!v) return state.loading = 'Waiting for slide...'
  state.loading = false
  document.title = v.title || 'ASlide'
  if (info.index === v.index) { // same slide
    sendIn({ slide: view.state.slide, session: view.state.id }, iframe)
  } else { // different slide
    show = false
    info.index = v.index
    view.session(info)
    await sleep(300)
    slide = null
    await sleep(20)
  }
  slide = v
  await sleep(300)
  show = true
})

watch(() => view.state.message, async () => {
  sendIn({ message: view.state.message }, iframe)
})

setListener(msg => { // iframe msg
  if (msg.ready) sendIn({ slide: view.state.slide, session: view.state.id, message: view.state.message }, iframe)
  if (msg.response) view.response(msg.response)
})

document.onvisibilitychange = () => {
  info.on = document.visibilityState === 'visible'
  view.session(info)
}

window.onbeforeunload = () => { view.stop() }

async function askName () {
  const { value } = await Swal.fire({
    title: 'Your Name?',
    input: 'text',
    inputPlaceholder: 'Enter your name',
    icon: 'question'
  })
  info.name = value.substring(0, 20)
  view.session(info)
}
if (!info.name) askName()
</script>

<template>
  <div class="w-full h-full all-transition" :class="show ? 'opacity-100' : 'opacity-0'">
    <iframe v-if="slide" class="w-full h-full" ref="iframe" :src="slide.surl" :key="String(slide.index + slide.surl)" sandbox="allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-same-origin allow-scripts allow-downloads" />
  </div>
</template>
