<script setup>
import { useRoute, useRouter } from 'vue-router'
import { state, login } from '../state'
const route = useRoute(), router = useRouter()
const token = route.query.token

if (login(token)) router.push('/home')
else window.location.href = 'https://auth.njsc.ltd/#/launch/aslide'
</script>

<template>
  <p class="p-3">Loading...</p>
</template>
