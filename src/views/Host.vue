<script setup>
import srpc from '../utils/srpc.js'
import state from '../state.js'
import plugins from '../plugins/index.js'
import { watch } from 'vue'
import ws from '../ws.js'
import { setListener, sendIn } from '../utils/iframe.js'
import EditableList from '../components/EditableList.vue'
import Wrapper from '../components/Wrapper.vue'
import { PlayIcon, PlusIcon, StopIcon, ChevronRightIcon, ChevronLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute(), router = useRouter()

const _id = route.params.id

let title = $ref(''), slides = $ref([]), playing = $ref(-1), editing = $ref(-1)

async function init () {
  state.loading = 'Loading...'
  const res = await srpc.get(state.user?.token, _id)
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
  const res = await srpc.put(state.user?.token, _id, data)
  state.loading = false
  if (!res) return Swal.fire('Error', 'Fail to save', 'error')
}

if (!state.user) router.push('/')
else init()

const parseTime = t => moment(t).format('YYYY-MM-DD HH:mm:ss')

function push () {
  const s = slides[playing]
  if (!s) return playing = -1
  ws.call('host.slide', { index: playing, title, surl: s.surl, data: s.data })
}

watch(() => slides[playing], push)

function play (i) {
  if (!channel.time || !slides[i]) return
  if (playing === i) push() // force update
  playing = i
  editing = i
}

// keyboard play
document.addEventListener('keyup', e => {
  const code = e.code
  if (code === 'ArrowLeft') play(playing - 1)
  if (code === 'ArrowRight') play(playing + 1)
}, false)

function stop () {
  ws.call('host.slide', null)
  playing = -1
}

let pluginSelector = $ref(false)
let plugin = $computed(() => {
  const s = slides[editing]
  if (!s) return ''
  for (const n in plugins) {
    if (plugins[n].surl === s.surl && plugin[n].eurl === s.eurl) return n
  }
  return 'Customize'
})
function usePlugin (t) {
  pluginSelector = false
  const s = slides[editing]
  if (!s) return
  s.surl = t.surl
  s.eurl = t.eurl
}

let iframe = $ref()
setListener(msg => { // msg from iframe editor
  if (msg.ready) sendIn({
    slide: slides[editing],
    sessions: channel.sessions,
    responses:channel.responses
  }, iframe)
  if (msg.slide) { // update slide
    for (const k in msg.slide) slides[editing][k] = msg.slide[k]
    if (editing === playing) play(playing) // current slide
  }
})

let channel = $ref({ input: '' })

function initChannel () {
  channel.id = '' // channel id, used to mark channel hosted
  channel.time = false // last message time, used to mark channel open
  channel.sessions = {}
  channel.responses = {}
  channel.slide = null
}
initChannel()

ws.handle = msg => {
  if (msg.session) return initChannel()
  if (msg.host === ws.session) channel.id = msg.channel
  if (msg.alert) Swal.fire(msg.alert.title, msg.alert.html, msg.alert.icon)
  if (!channel.id) return // not hosting
  channel.time = Date.now()
  if (msg.sessions) {
    for (const s in msg.sessions) {
      if (msg.sessions[s]) channel.sessions[s] = msg.sessions[s]
      else delete channel.sessions[s]
    }
  }
  if (msg.responses) {
    for (const r in msg.responses) channel.responses[r] = msg.responses[r]
  }
  if (editing === playing) sendIn({ sessions: msg.sessions, responses: msg.responses }, iframe)
  if (typeof msg.slide !== 'undefined') {
    channel.slide = msg.slide
    if (channel.slide) channel.sessions[ws.session].index = channel.slide.index
  }
}

let viewUrl = $computed(() => window.location.href.replace(/\/host\/(.*)/, '/view/' + channel.id))

function join () {
  ws.call('host.join', channel.input)
}

function leave () {
  initChannel()
  ws.call('view.leave')
}
</script>

<template>
  <div class="w-screen h-screen flex bg-gray-100 min-w-[1024px]">
    <div class="flex flex-col grow h-full"><!-- slide control -->
      <div class="flex p-2 flex items-center justify-between"><!-- title -->
        <input class="font-bold text-xl block grow px-2 rounded" placeholder="Title" v-model="title">
        <button class="bg-blue-500 px-3 py-1 font-bold shadow all-transition hover:shadow-md rounded text-white mx-2" @click="save">Save</button>
      </div>
      <div class="flex grow p-2 h-0"><!-- slides -->
        <div class="flex flex-col w-48 overflow-auto"><!-- slide list -->
          <h3 class="font-bold text-lg flex items-center justify-between">
            Slides
            <div class="flex items-center justify-center text-blue-300" v-if="channel.time">
              <ChevronLeftIcon @click="play(playing - 1)" class="w-5 mx-1 all-transition hover:text-blue-500 cursor-pointer" :class="playing < 1 && 'invisible'" />
              <StopIcon @click="stop" class="w-7 mx-1 all-transition hover:text-blue-500 cursor-pointer" :class="playing < 0 && 'invisible'" />
              <ChevronRightIcon @click="play(playing + 1)" class="w-5 mx-1 all-transition hover:text-blue-500 cursor-pointer" :class="playing >= slides.length - 1 && 'invisible'" />
            </div>
          </h3>
          <EditableList :list="slides" item-class="border rounded px-2 py-1 bg-white my-1">
            <template #item="{ elment: el, index: i }">
              <div class="flex items-center cursor-pointer text-gray-700" :class="editing === i && 'font-bold text-black'" @click="editing = i">
                <PlayIcon class="w-5 mr-2 all-transition" :class="playing === i ? 'text-blue-500' : 'text-gray-200 hover:text-gray-500'" @click.stop="play(i)" />
                Slide {{ i }}
              </div>
            </template>
          </EditableList>
          <div class="border px-2 py-1 rounded cursor-pointer my-1 all-transition hover:border-blue-500 hover:text-blue-500 hover:bg-white" @click="slides.push({})">
            <PlusIcon class="w-5 m-auto" />
          </div>
        </div>
        <div class="flex flex-col grow p-2" v-if="slides[editing]"><!-- slide editor -->
          <div class="bg-white rounded p-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <h3 class="font-bold text-lg">Slide {{ editing }}</h3>
                <button class="bg-blue-100 text-blue-500 font-bold text-sm px-2 py-1 rounded mx-2 all-transition hover:bg-blue-200 flex items-center" @click="pluginSelector = !pluginSelector">{{ plugin }}<ChevronDownIcon class="w-3 ml-1" /></button>
              </div>
              <PlayIcon class="w-5 mr-2 all-transition cursor-pointer" :class="playing === editing ? 'text-blue-500' : 'text-gray-200 hover:text-gray-500'" @click.stop="play(editing)" />
            </div>
            <Wrapper :show="pluginSelector"><!-- slide plugin selecor -->
              <div class="grid grid-cols-5 xl:grid-cols-6 py-2 text-gray-500 font-bold text-sm">
                <button v-for="(t, n) in plugins" class="all-transition bg-gray-100 hover:bg-gray-200 p-1 m-1" @click="usePlugin(t)">{{ n }}</button>
                <button class="all-transition bg-gray-100 hover:bg-gray-200 p-1 m-1" @click="usePlugin({})">Customize</button>
              </div>
            </Wrapper>
            <Wrapper :show="plugin === 'Customize'" class="py-1"><!-- customize slide urls -->
              <label class="text-sm my-1 flex items-center">
                Slide URL: 
                <input class="rounded px-2 font-mono border mx-2 block grow" v-model="slides[editing].surl" placeholder="Slide URL">
              </label>
              <label class="text-sm my-1 flex items-center">
                Editor URL: 
                <input class="rounded px-2 font-mono border mx-2 block grow" v-model="slides[editing].eurl" placeholder="Editor URL">
              </label>
            </Wrapper>
          </div>
          <iframe v-if="slides[editing].eurl" class="grow" ref="iframe" :src="slides[editing].eurl" :key="editing + slides[editing].eurl" sandbox="allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-scripts" />
        </div>
      </div>
    </div>
    <div class="flex flex-col w-64 bg-gray-700 text-white"><!-- channel control -->
      <div class="w-full p-2 flex flex-col"><!-- control panel -->
        <h3 class="font-bold text-lg">Channel Control</h3>
        <input v-model="channel.input" placeholder="Channel ID" :readonly="channel.time" class="px-2 rounded text-black opacity-80 font-mono font-bold my-1">
        <div class="flex justify-between items-center my-1">          
          <div class="text-gray-300 text-xs flex items-center">
            <div class="rounded-full h-4 w-4 mr-2" :class="channel.time ? 'bg-green-600' : 'bg-gray-500'" />
            {{ channel.time ? parseTime(channel.time) : 'unconnected' }}
          </div>
          <button v-if="channel.time" class="rounded bg-red-700 all-transition shadow hover:shadow-md px-3 font-bold" @click="leave">Leave</button>
          <button v-if="!channel.time && channel.input" class="rounded bg-yellow-600 all-transition shadow hover:shadow-md px-3 font-bold" @click="join">Join</button>
        </div>
        <p v-if="channel.time" class="font-mono select-all my-1" style="font-size: 0.65rem;">{{ viewUrl }}</p>
      </div>
      <div class="w-full grow overflow-auto p-2"><!-- session list -->
        <h3 class="font-bold text-lg">Sessions ({{ Object.keys(channel.sessions).length }})</h3>
        <hr>
        <div v-for="(s, id) in channel.sessions" class="flex justify-between items-center my-0.5 px-1">
          {{ s?.name || 'Anonymous' + (id === ws.session ? '(me)' : '') }}
          <div class="all-transition rounded-full px-2 text-xs" v-if="playing >= 0" :class="playing === s.index ? 'bg-green-600' : 'bg-gray-500'">{{ typeof s.index === 'undefined' ? 'N/A' : s.index }}</div>
        </div>
      </div>
    </div>
  </div>
</template>