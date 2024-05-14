<script setup>
import { watch, reactive } from 'vue'
import { sendOut, setListener } from '../utils/iframe.js'
import { debounce } from '../utils/utils.js'
import Toggle from '../components/Toggle.vue'
import CodeMirror from '../components/CodeMirror.vue'
import EditableList from '../components/EditableList.vue'
import ProgressBar from '../components/ProgressBar.vue'
import { PlusCircleIcon } from '@heroicons/vue/24/outline'
sendOut({ ready: 1 })

let html = $ref(''), options = $ref([]), sessions = reactive({}), responses = reactive({})

let sessionCot = $computed(() => Object.keys(sessions).length)
let responseCot = $computed(() => Object.keys(sessions).filter(x => responses[x]).length)
const optionCot = key => Object.keys(sessions).filter(x => responses[x] === key).length

setListener(msg => {
  if (msg.slide) {
    const data = msg.slide.data || {}
    html = typeof data.html === 'undefined' ? 'This is choice prompt, and it supports HTML.' : data.html
    options = data.options || []
  }
  if (msg.sessions) {
    for (const k in msg.sessions) {
      if (msg.sessions[k]) sessions[k] = msg.sessions[k]
      else delete sessions[k]
    }
  }
  if (msg.responses) {
    for (const k in msg.responses) responses[k] = msg.responses[k]
    if (publish) computeResult()
  }
})

let publish = $ref(false)
const computeResult = () => {
  for (const o of options) {
    if (publish) o.ratio = optionCot(o.key) / responseCot
    else delete o.ratio
  }
}
watch($$(publish), computeResult)

const update = debounce(() => {
  sendOut({ slide: { data: { html, options } } })
})

function addOption () {
  options.push({
    key: Math.random().toString(36).substring(2),
    text: 'New Option'
  })
  update()
}

watch($$(html), update)
watch($$(options), update, { deep: true })
</script>

<template>
  <div class="p-2 relative h-full">
    <h2 class="font-bold text-lg my-2 flex items-center justify-between">
      Choice Slide Editor
      <div class="flex items-center">
        <Toggle v-model="publish" class="text-sm">Publish Result</Toggle>
      </div>
    </h2>
    <div class="flex items-center my-4 font-bold">
      <ProgressBar class="grow mr-2" :ratio="responseCot / sessionCot" />
      {{ responseCot }} / {{ sessionCot }}
    </div>
    <label class="font-bold m-2 block">Choice Prompt: </label>
    <CodeMirror v-model="html" class="bg-white" language="html" />
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
