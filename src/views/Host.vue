<script setup>
import srpc from '../utils/srpc.js'
import { SS, state } from '../state.js'
import { download } from '../utils/utils.js'
import { watch } from 'vue'
import * as host from '../utils/peerHost.js'
import { setListener, sendIn } from '../utils/iframe.js'
import Control from '../components/Control.vue'
import SlideList from '../components/SlideList.vue'
import SlideHeader from '../components/SlideHeader.vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/solid'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute(), router = useRouter()

const id = route.params.id // local for local

let title = $ref(''), slides = $ref([]), playing = $ref(-1), editing = $ref(-1)

async function init () {
  state.loading = 'Loading...'
  const res = id === 'local'
    ? JSON.parse(SS.local)
    : await srpc.get(state.user?.token, id)
  state.loading = false
  if (!res) {
    await Swal.fire('Error', 'Cannot fetch your show', 'error')
    return router.push('/home')
  }
  title = res.title
  slides = res.slides
}

async function save () {
  const data = { slides, title }
  state.loading = 'Loading...'
  const res = await srpc.put(state.user?.token, id, data)
  state.loading = false
  if (!res) return Swal.fire('Error', 'Fail to save', 'error')
}

function exportFile () {
  const data = btoa(String.fromCharCode(...new TextEncoder('utf-8').encode(JSON.stringify(slides))))
  download(data, title + '.aslide')
}

if (!state.user && id !== 'local') router.push('/')
else init()

function push () {
  const s = slides[playing]
  if (!s) return stop()
  host.slide({ index: playing, title, surl: s.surl, data: s.data })
}

watch(() => slides[playing], push)

function play (i) {
  if (!host.state.id || !slides[i]) return
  if (playing === i) push() // force update
  if (playing === i) return
  playing = i
  if (editing === playing) sendIn({ sessions: host.state.sessions, responses: host.state.responses }, iframe)
  editing = i
}

function stop () {
  host.slide(null)
  playing = -1
}

function edit (i) {
  editing = i
}

window.onbeforeunload = () => { host.stop() }

// keyboard play
document.addEventListener('keyup', e => {
  const code = e.code
  if (code === 'ArrowLeft') play(playing - 1)
  if (code === 'ArrowRight') play(playing + 1)
}, false)



let iframe = $ref()
setListener(msg => { // msg from iframe editor
  if (msg.ready) sendIn({
    slide: slides[editing],
    sessions: host.state.sessions,
    responses: host.state.responses
  }, iframe)
  if (msg.slide) { // update slide
    for (const k in msg.slide) slides[editing][k] = msg.slide[k]
    if (editing === playing) play(playing) // current slide
  }
  if (msg.messages) host.messages(msg.messages)
})

host.handles.sessions = v => {
  sendIn({ sessions: v }, iframe)
}

host.handles.responses = v => {
  if (playing === editing) sendIn({ responses: v }, iframe)
}
window.host = host
</script>

<template>
  <div class="w-screen h-screen flex bg-gray-100 min-w-[1024px]">
    <div class="flex flex-col grow h-full"><!-- slide control -->
      <div class="flex p-2 flex items-center justify-between"><!-- title -->
        <input class="font-bold text-xl block grow px-2 rounded" placeholder="Title" v-model="title">
        <button class="bg-blue-100 p-2 font-bold all-transition hover:bg-blue-200 rounded text-blue-500 ml-2" title="Export to file" @click="exportFile"><ArrowDownTrayIcon class="w-4" /></button>
        <button class="bg-blue-500 px-3 py-1 font-bold shadow all-transition hover:shadow-md rounded text-white mx-2" title="Save to cloud" @click="save" v-if="id !== 'local'">Save</button>
      </div>
      <div class="flex grow p-2 h-0"><!-- slides -->
        <SlideList :playing="playing" :editing="editing" :slides="slides" @play="play" @stop="stop" @edit="edit" />
        <div class="flex flex-col grow p-2" v-if="slides[editing]"><!-- slide editor -->
          <SlideHeader :slides="slides" :editing="editing" :playing="playing" @play="play" />
          <iframe v-if="slides[editing].eurl" class="grow" ref="iframe" :src="slides[editing].eurl" :key="editing + slides[editing].eurl" sandbox="allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-scripts allow-downloads" />
        </div>
      </div>
    </div>
    <Control :playing="playing" />
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: 0.4rem;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 0.4rem;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  border-radius: 0.4rem;
  background: #ccc;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #ddd;
}
</style>
