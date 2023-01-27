<script setup>
let channel = $ref('')
</script>

<template>
  <div class="m-auto min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-200 to-green-200"> 
    <h1 class="text-8xl uppercase font-[700] bg-gradient-to-r from-green-500 to-blue-600 inline-block bg-clip-text text-transparent">  Aslide </h1> 
    <input ref="inputElement" class="w-1/5 mt-10 mb-4 rounded px-3 py-2 radius-2 border-2 border-gray-300 focus:ring-1 focus:border-blue-300 transition font-mono text-center"
        :placeholder="channel"
        :type="text"
        v-model="channel">
  </div>
</template>
