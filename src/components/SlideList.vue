<script setup>
import EditableList from './EditableList.vue'
import * as host from '../utils/peerHost.js'
import { PlayIcon, PlusIcon, PauseIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/vue/24/solid'
const { playing, editing, slides } = defineProps(['playing', 'editing', 'slides'])
const emits = defineEmits(['edit', 'play', 'stop'])

const play = i => emits('play', i)
const stop = () => emits('stop')
const edit = i => emits('edit', i)

const playIconColor = i => {
  if (!host.state.id) return 'text-transparent'
  if (playing === i) return 'text-blue-500'
  return 'text-gray-200 hover:text-gray-500'
}
</script>

<template>
  <div class="flex flex-col w-full h-full overflow-y-auto"><!-- slide list -->
    <h3 class="font-bold text-lg flex items-center justify-between">
      Slide List
      <div class="flex items-center justify-center text-blue-500" v-if="host.state.id">
        <ChevronLeftIcon @click="play(playing - 1)" class="w-5 mx-1 all-transition hover:scale-125 cursor-pointer" :class="playing < 1 && 'invisible'" />
        <PauseIcon @click="stop" class="w-6 mx-1 all-transition hover:scale-125 cursor-pointer" :class="playing < 0 && 'invisible'" />
        <ChevronRightIcon @click="play(playing + 1)" class="w-5 mx-1 all-transition hover:scale-125 cursor-pointer" :class="playing >= slides.length - 1 && 'invisible'" />
      </div>
    </h3>
    <EditableList :list="slides" item-class="border rounded px-2 py-1 bg-white my-1">
      <template #item="{ element: el, index: i }">
        <div class="flex items-center cursor-pointer text-gray-700 grow" :class="editing === i && 'font-bold text-black'" @click="edit(i)">
          <PlayIcon class="w-5 mr-1 all-transition" :class="playIconColor(i)" @click.stop="play(i)" />
          <div class="select-none">{{ i }}.</div>
          <div class="grow mx-1">
            <input class="min-w-full w-0 bg-transparent" v-model="el.name">
          </div>
        </div>
      </template>
    </EditableList>
    <div class="border p-2 rounded cursor-pointer my-1 all-transition border-green-500 text-green-500 bg-green-50 hover:bg-green-100 flex items-center justify-center" @click="slides.push({ name: '(New Slide)' })">
      <PlusIcon class="w-5 mr-2" />
      New Slide
    </div>
  </div>
</template>

