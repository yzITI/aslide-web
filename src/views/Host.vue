<script setup>
import ws from '../ws.js'
import EditableList from '../components/EditableList.vue'
import { PlayIcon, PlusIcon, PencilIcon } from '@heroicons/vue/24/solid'

const parseTime = t => moment(t).format('YYYY-MM-DD HH:mm:ss')

let slides = $ref([]), playing = $ref(-1), editing = $ref(-1)

function play (i) {
  if (!channel.time) return
  if (playing === i) { // close playing
    ws.call('host.slide', null)
    playing = -1
  } else { // start playing
    ws.call('host.slide', { index: i, surl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' })
    playing = i
  }
}

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
  console.log(msg)
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
  if (typeof msg.slide !== 'undefined') channel.slide = msg.slide
}

let viewUrl = $computed(() => window.location.href.replace(/\/host\/(.*)/, '/@/' + channel.id))

function join () {
  ws.call('host.join', channel.input)
}

function leave () {
  initChannel()
  ws.call('view.leave')
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex bg-gray-100 min-w-[1024px]">
    <div class="flex flex-col grow"><!-- slide control -->
      <div class="flex p-2"><!-- title -->
        <input class="font-bold text-xl block w-2/3 px-2 rounded" placeholder="Title">
      </div>
      <div class="flex grow p-2"><!-- slides -->
        <div class="flex flex-col w-48"><!-- slide list -->
          <h3 class="font-bold text-lg">Slides</h3>
          <EditableList :list="slides" item-class="border rounded px-2 py-1 bg-white my-1">
            <template #item="{ elment: el, index: i }">
              <div class="flex items-center font-bold cursor-pointer" @click="editing = i">
                <PlayIcon class="w-5 mr-2 all-transition" :class="channel.slide?.index === i ? 'text-blue-500' : 'text-gray-200 hover:text-gray-500'" @click.stop="play(i)" />
                Slide {{ i }}
                <PencilIcon v-if="editing === i" class="w-3 text-blue-500 ml-1" />
              </div>
            </template>
          </EditableList>
          <div class="border px-2 py-1 rounded cursor-pointer my-1 all-transition hover:border-blue-500 hover:text-blue-500 hover:bg-white" @click="slides.push({})">
            <PlusIcon class="w-5 m-auto" />
          </div>
        </div>
        <div class="flex flex-col grow"><!-- slide editor -->
        </div>
      </div>
    </div>
    <div class="flex flex-col w-60 bg-gray-700 text-white"><!-- channel control -->
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
        <p v-if="channel.time" class="font-mono select-all my-1" style="font-size: 0.6rem;">{{ viewUrl }}</p>
      </div>
      <div class="w-full grow overflow-auto p-2"><!-- session list -->
        <h3 class="font-bold text-lg">Sessions</h3>
        <hr>
        <div v-for="(s, id) in channel.sessions" class="flex justify-between items-center">
          {{ s?.name || 'Anonymous' + (id === ws.session ? '(me)' : '') }}
          <div class="all-transition rounded-full px-2 text-xs" :class="playing === s.index ? 'bg-green-600' : 'bg-gray-500'">{{ typeof s.index === 'undefined' ? 'N/A' : s.index }}</div>
        </div>
      </div>
    </div>
  </div>
</template>