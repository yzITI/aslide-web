<script setup>
import srpc from '../utils/srpc.js'
import state from '../state.js'
import { useRouter } from 'vue-router'
import { PlusIcon, TvIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

let shows = $ref([])
state.loading = 'Loading...'

const parseTime = t => moment(t).format('YYYY-MM-DD HH:mm:ss')

async function init () {
  state.loading = 'Loading...'
  const res = await srpc.getList(state.user?.token)
  state.loading = false
  if (!res) return Swal.fire('Error', 'Cannot fetch your shows', 'error')
  shows = res.sort((a, b) => b.time - a.time)
}

if (!state.user) router.push('/')
else init()

const random = () => Math.random().toString(36).substring(2)

async function create (data = { title: 'Untitled', slides: [] }) {
  state.loading = 'Loading...'
  const show = random()
  const res = await srpc.put(state.user?.token, show, data)
  state.loading = false
  shows.push({ show, title: data.title, time: Date.now() })
  shows.sort((a, b) => b.time - a.time)
}

async function del (s) {
  const { isConfirmed } = await Swal.fire({
    title: 'Delete?',
    html: `Are you sure to delete ${s.title}?`,
    showCancelButton: true,
    icon: 'warning'
  })
  if (!isConfirmed) return
  state.loading = 'Loading...'
  const res = await srpc.del(state.user?.token, s.show)
  state.loading = false
  shows = shows.filter(x => x !== s)
}

let fileInput = $ref()

function upload (f) {
  if (!f.name.match(/\.aslide$/)) return Swal.fire('Error', 'Invalid File Type', 'error')
  const reader = new FileReader()
  reader.addEventListener('load', e => {
    const value = e.target.result
    const value_latin1 = atob(value)
    const json = new TextDecoder('utf-8').decode(Uint8Array.from({ length: value_latin1.length }, (element, index) => value_latin1.charCodeAt(index)))
    create({ title: f.name.replace(/\.aslide$/, ''), slides: JSON.parse(json) })
  })
  reader.readAsText(f)
  fileInput.value = ''
}

function dropFile (e) {
  upload(e.dataTransfer.files[0])
}
</script>

<template>
  <div class="p-4 sm:p-10 min-h-screen bg-gray-100" @drop.prevent="dropFile" @dragenter.prevent @dragover.prevent>
    <h1 class="text-xl sm:text-3xl font-bold my-4">Your Shows</h1>
    <p v-if="!shows.length" class="my-2">You don't have slideshows now. Create one?</p>
    <div v-else class="pb-16">
      <div v-for="s in shows" class="my-2 p-2 shadow all-transition hover:shadow-md rounded bg-white flex items-center justify-between cursor-pointer" @click="router.push('/host/' + s.show)">
        <div class="flex items-center text-gray-800">
          <TvIcon class="w-8 mx-3" />
          <div>
            <h4 class="text-lg font-bold">{{ s.title }}</h4>
            <p class="text-xs text-gray-500">{{ parseTime(s.time) }}</p>
          </div>
        </div>
        <div class="flex items-center">
          <TrashIcon class="w-6 text-red-500 mx-2" @click.stop="del(s)" />
        </div>
      </div>
    </div>
    <div class="overflow-hidden rounded-full flex items-center fixed right-4 top-4 z-10 shadow-md">
      <button title="Import from File" class="bg-white text-gray-700 p-2 pl-4 all-transition" @click="fileInput.click"><ArrowUpTrayIcon class="w-8" /></button>
      <button title="Create New" class="bg-blue-500 text-white p-2 pr-4 shadow all-transition hover:shadow-md" @click="create()"><PlusIcon class="w-8" /></button>
    </div>
    <input type="file" class="hidden" ref="fileInput" @change="upload(fileInput.files[0])">
  </div>
</template>
