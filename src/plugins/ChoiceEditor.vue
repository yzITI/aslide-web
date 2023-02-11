<script setup>
import { watch } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import CodeMirror from '../components/CodeMirror.vue'
import EditableList from '../components/EditableList.vue'
import ProgressBar from '../components/ProgressBar.vue'
import { PlusCircleIcon } from '@heroicons/vue/24/outline'
sendOut({ ready: 1 })

let html = $ref(''), options = $ref([]), sessions = $ref({}), responses = $ref({})

let sessionCot = $computed(() => Object.keys(sessions).length - 1)
let responseCot = $computed(() => Object.keys(sessions).filter(x => responses[x]).length)
const optionCot = key => Object.keys(sessions).filter(x => responses[x] === key).length

setListener(msg => {
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = typeof data.html === 'undefined' ? 'This is choice prompt, and it supports HTML.' : data.html
    options = data.options || []
  }
  if (msg.sessions) sessions = msg.sessions
  if (msg.responses) responses = msg.responses
  console.log(msg)
})

function publish () {
  for (const o of options) o.ratio = optionCot(o.key) / responseCot
  sendOut({ slide: { data: { html, options } } })
}

function update () {
  sendOut({ slide: { data: { html, options } } })
}

function addOption () {
  options.push({
    key: Math.random().toString(36).substring(2),
    text: 'New Option'
  })
}
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2 flex items-center justify-between">
      Choice Slide Editor
      <div class="flex items-center text-white font-bold">
        <button @click="publish" class="bg-yellow-500 px-2 py-1 rounded text-sm shadow all-transition hover:shadow-md mr-2">Publish Result</button>
        <button @click="update" class="bg-blue-500 px-2 py-1 rounded text-sm shadow all-transition hover:shadow-md">Update Slide</button>
      </div>
    </h2>
    <div class="flex items-center my-4 font-bold">
      <ProgressBar class="grow mr-2" :ratio="responseCot / sessionCot" />
      {{ responseCot }} / {{ sessionCot }}
    </div>
    <label class="font-bold m-2 block">Choice Prompt: </label>
    <CodeMirror v-model="html" class="bg-white" />
    <label class="font-bold m-2 block flex items-center">Choice Options: <PlusCircleIcon class="w-6 ml-2 cursor-pointer text-blue-500" @click="addOption" /></label>
    <div>
      <EditableList :list="options" item-class="border rounded bg-white my-2 p-2">
        <template #item="{ element: el, index: i }">
          <div class="text-gray-700 grow px-1">
            <input class="block w-full" v-model="el.text">
            <div class="flex items-center my-1 text-xs">
              <ProgressBar class="grow mr-2" :ratio="optionCot(el.key) / responseCot" />
              {{ optionCot(el.key) }} / {{ responseCot }}
            </div>
          </div>
        </template>
      </EditableList>
    </div>
  </div>
</template>