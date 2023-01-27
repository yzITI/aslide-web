<script setup>
import loadingImg from '../assets/loading.svg'
import state from '../state.js'
</script>

<template>
  <Transition name="fade">
    <div class="z-50 bg-gray-100 flex flex-col justify-center items-center top-0 right-0 bottom-0 left-0 fixed" v-if="state.loading">
      <img :src="loadingImg" class="w-56 h-56">
      <p v-if="typeof state.loading === 'string'">{{ state.loading }}</p>
    </div>
  </Transition>
</template>
