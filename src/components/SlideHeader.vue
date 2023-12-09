<script setup>
import Wrapper from './Wrapper.vue'
import state from '../state.js'
import { PlayIcon, ChevronDownIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/solid'
const { slides, editing, playing } = defineProps(['slides', 'editing', 'playing'])
const emits = defineEmits(['play'])

const play = i => emits('play', i)

let plugins = $computed(() => state.plugins)

let showPluginSelector = $ref(false)

let plugin = $computed(() => {
  const s = slides[editing]
  if (!s) return ''
  for (const n in plugins) {
    if (plugins[n].surl === s.surl && plugins[n].eurl === s.eurl) return n
  }
  return 'Customize'
})

function usePlugin (t) {
  showPluginSelector = false
  const s = slides[editing]
  if (!s) return
  s.surl = t.surl
  s.eurl = t.eurl
  if (editing === playing) play(playing) 
}
</script>

<template>

  <div class="bg-white rounded p-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <h3 class="font-bold text-lg">Slide {{ editing }}</h3>
        <button class="bg-blue-100 text-blue-500 font-bold text-sm px-2 py-1 rounded mx-2 all-transition hover:bg-blue-200 flex items-center" @click="showPluginSelector = !showPluginSelector">{{ plugin }}<ChevronDownIcon class="w-3 ml-1" /></button>
      </div>
      <div class="flex items-center">
        <TrashIcon class="w-5 mr-2 all-transition cursor-pointer text-red-200 hover:text-red-500" @click.stop="slides.splice(editing, 1)" />
        <DocumentDuplicateIcon class="w-5 mr-2 all-transition cursor-pointer text-green-200 hover:text-green-500" @click.stop="slides.splice(editing, 0, JSON.parse(JSON.stringify(slides[editing])))" />
        <PlayIcon class="w-5 mr-2 all-transition cursor-pointer" :class="playing === editing ? 'text-blue-500' : 'text-gray-200 hover:text-gray-500'" @click.stop="play(editing)" />
      </div>
    </div>
    <Wrapper :show="showPluginSelector"><!-- slide plugin selecor -->
      <div class="grid grid-cols-5 xl:grid-cols-6 py-2 text-gray-500 font-bold text-sm">
        <button class="all-transition bg-gray-100 hover:bg-gray-200 p-1 m-1" @click="usePlugin({})">Customize</button>
        <button v-for="(t, n) in plugins" class="all-transition bg-gray-100 hover:bg-gray-200 p-1 m-1" @click="usePlugin(t)">{{ n }}</button>
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
</template>
