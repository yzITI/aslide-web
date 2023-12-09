<script setup>
import * as host from '../utils/peerHost.js'
let channel = $ref('')
const { playing } = defineProps(['playing'])

const parseTime = t => moment(t).format('YYYY-MM-DD HH:mm:ss')

function start () {
  if (!channel) return
  host.start(channel)
}

let viewUrl = $computed(() => window.location.href.replace(/\/host\/(.*)/, '/view/' + channel))
</script>

<template>
  <div class="flex flex-col w-64 bg-gray-700 text-white"><!-- channel control -->
    <div class="w-full p-2 flex flex-col"><!-- control panel -->
      <h3 class="font-bold text-lg">Channel Control</h3>
      <input v-model="channel" placeholder="Channel ID" :readonly="host.state.on" @keyup.enter="start" class="px-2 rounded text-black opacity-80 font-mono font-bold my-1">
      <div class="flex justify-between items-center my-1">          
        <div class="text-gray-300 text-xs flex items-center">
          <div class="rounded-full h-4 w-4 mr-2" :class="host.state.id ? 'bg-green-600' : 'bg-gray-500'" />
          {{ host.state.id ? parseTime(host.state.time) : 'unconnected' }}
        </div>
        <button v-if="host.state.on" class="rounded bg-red-700 all-transition shadow hover:shadow-md px-3 font-bold" @click="host.stop()">Stop</button>
        <button v-if="!host.state.on && channel" class="rounded bg-yellow-600 all-transition shadow hover:shadow-md px-3 font-bold" @click="start">Start</button>
      </div>
      <p v-if="host.state.on" class="font-mono select-all my-1" style="font-size: 0.65rem;">{{ viewUrl }}</p>
    </div>
    <div class="w-full grow overflow-y-auto p-2"><!-- session list -->
      <h3 class="font-bold text-lg">Sessions ({{ Object.keys(host.state.sessions).length }})</h3>
      <hr>
      <div v-for="s in host.state.sessions" class="flex items-center my-0.5 px-1 overflow-x-hidden">
        <div class="all-transition rounded-full px-2 text-xs mr-2" :class="playing === s.index ? 'bg-green-600' : 'bg-gray-500'">{{ (playing < 0 || typeof s.index === 'undefined') ? 'N/A' : s.index }}</div>
        <span class="all-transition whitespace-nowrap" :class="s.on ? 'text-gray-50' : 'text-gray-400'">{{ s?.name || 'Anonymous' }}</span>
      </div>
    </div>
  </div>
</template>
