<script setup>
import ws from '../ws.js'

const parseTime = t => moment(t).format('YYYY-MM-DD HH:mm:ss')

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
      if (s) channel.sessions[s] = msg.sessions[s]
      else delete channel.sessions[s]
    }
  }
  if (msg.responses) {
    for (const r in msg.responses) channel.responses[r] = msg.responses[r]
  }
  if (msg.slide) channel.slide = msg.slide
}

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
        <h1 class="font-bold text-xl">Test Title</h1>
      </div>
      <div class="flex grow"><!-- slides -->
        <div class="flex flex-col w-48"><!-- slide list -->
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
      </div>
      <div class="w-full grow overflow-auto p-2"><!-- session list -->
        <h3 class="font-bold text-lg">Sessions</h3>
        <hr>
        <div v-for="(s, id) in channel.sessions">{{ s.name || 'Anonymous' + (id === ws.session ? '(me)' : '') }}</div>
      </div>
    </div>
  </div>
</template>