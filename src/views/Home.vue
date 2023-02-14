<script setup>
import srpc from '../utils/srpc.js'
import state from '../state.js'
import { useRouter } from 'vue-router'
import { PlusIcon, TvIcon, TrashIcon } from '@heroicons/vue/24/outline'

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

async function create () {
  state.loading = 'Loading...'
  const show = random(), title = 'Untitled'
  const res = await srpc.put(state.user?.token, show, { title, slides: [] })
  state.loading = false
  shows.push({ show, title, time: Date.now() })
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
</script>

<template>
  <div class="p-4 sm:p-10 min-h-screen bg-gray-100">
    <h1 class="text-xl sm:text-3xl font-bold my-3">Your Shows</h1>
    <p v-if="!shows.length">You don't have show now. Create one?</p>
    <div v-else>
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
    <button class="fixed right-10 bottom-10 rounded-full bg-blue-500 text-white p-3 shadow all-transition hover:shadow-md z-10" @click="create"><PlusIcon class="w-8" /></button>
  </div>
</template>