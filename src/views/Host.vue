<script setup>
import srpc from '../utils/srpc.js'
import { SS, state } from '../state.js'
import { download } from '../utils/utils.js'
import { watch } from 'vue'
import * as host from '../utils/peerHost.js'
import { setListener, sendIn } from '../utils/iframe.js'
import ChannelControl from '../components/ChannelControl.vue'
import SlideList from '../components/SlideList.vue'
import SlideHeader from '../components/SlideHeader.vue'
import { ArrowDownTrayIcon, CloudArrowUpIcon, ListBulletIcon, TvIcon, CogIcon } from '@heroicons/vue/24/solid'
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
  if (e.srcElement.value) return
  const code = e.code
  if (code === 'ArrowLeft') play(playing - 1)
  if (code === 'ArrowRight') play(playing + 1)
  if (code === 'Space') play(editing)
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

let panel = $ref('list') // list|channel|slide

window.onbeforeunload = () => 'Are you sure you want to leave?'
</script>

<template>
  <div class="w-full h-screen flex bg-gray-100">
    <div class="flex flex-col grow h-full"><!-- slide control -->
      <div class="flex p-2 w-full items-center justify-between"><!-- title -->
        <input class="font-bold border text-xl block grow px-2 py-1 rounded w-0" placeholder="Title" v-model="title">
        <button class="bg-blue-100 p-2 all-transition hover:bg-blue-200 rounded text-blue-500 ml-2" title="Export to file" @click="exportFile"><ArrowDownTrayIcon class="w-5" /></button>
        <button class="bg-blue-500 p-1 shadow all-transition hover:shadow-md rounded text-white hover:bg-blue-600 mx-2" title="Save to cloud" @click="save" v-if="id !== 'local'"><CloudArrowUpIcon class="w-7" /></button>
      </div>
      <div class="flex grow p-2 h-0 relative"><!-- slides -->
        <div class="absolute top-0 h-full w-full p-2 pb-16 md:p-0 md:pb-0 md:static md:w-56 all-transition bg-gray-100 z-20" :style="{ left: panel === 'list' ? 0 : '-100%' }">
          <SlideList :playing="playing" :editing="editing" :slides="slides" @play="play" @stop="stop" @edit="edit" />
        </div>
        <div class="flex flex-col grow p-2" v-if="slides[editing]"><!-- slide editor -->
          <SlideHeader :slides="slides" :editing="editing" :playing="playing" @play="play" />
          <iframe v-if="slides[editing].eurl" class="grow" ref="iframe" :src="slides[editing].eurl" :key="editing + slides[editing].eurl" sandbox="allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-scripts allow-downloads" />
        </div>
      </div>
    </div>
    <div class="fixed top-0 h-full w-full p-2 pb-16 md:p-0 md:pb-0 md:static md:w-64 all-transition bg-gray-700 z-20" :style="{ right: panel === 'channel' ? 0 : '-100%' }">
      <ChannelControl :playing="playing" @stop="playing = -1" />
    </div>
  </div>
  <div class="fixed right-3 bottom-3 flex md:hidden z-30 shadow-md rounded-lg overflow-hidden">
    <button @click="panel = 'list'" class="p-2 all-transition" :class="panel === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"><ListBulletIcon class="w-7" /></button>
    <button @click="panel = 'slide'" class="border-x p-2 all-transition" :class="panel === 'slide' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"><TvIcon class="w-7" /></button>
    <button @click="panel = 'channel'" class="p-2 all-transition" :class="panel === 'channel' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'"><CogIcon class="w-7" /></button>
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
