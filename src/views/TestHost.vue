<script setup>
import * as host from '../utils/peerHost.js'
window.host = host
</script>

<template>
  This is test host page
  <div v-for="(v, k) in host.state.sessions">{{ k }}</div>
</template>
