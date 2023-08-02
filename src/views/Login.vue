<script setup>
import { useRoute, useRouter } from 'vue-router'
import { state, SS } from '../state'
const route = useRoute(), router = useRouter()
const token = route.query.token

function decode (input) {
  if (!input) return {}
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad) input += new Array(5 - pad).join('=')
  return JSON.parse(decodeURIComponent(atob(input).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
}

if (token) {
  state.user = decode(token.split('.')[1])
  state.user.token = token
  SS.user = JSON.stringify(state.user)
}

if (state.user?.token) router.push('/home')
else window.location.href = 'https://cn.njsc.ltd/#/launch/aslide'
</script>

<template>
  <p class="p-3">Loading...</p>
</template>