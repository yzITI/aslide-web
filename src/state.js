import { reactive } from 'vue'

export const SS = window.sessionStorage

export const state = reactive({
  loading: false,
  user: null,
  plugins: {},
  screen: {}
})

export function login (token) {
  SS.removeItem('token')
  let input = token?.split('.')?.[1]
  if (!input) return false
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad) input += new Array(5 - pad).join('=')
  const payload = JSON.parse(decodeURIComponent(atob(input).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
  if (payload.iat + 86400e3 < Date.now()) return false
  payload.token = token
  SS.token = token
  state.user = payload
  return payload
}

if (SS.token) login(SS.token)

async function fetchPlugins () {
  state.plugins = await fetch('./plugins/index.json').then(r => r.json())
}
fetchPlugins()

window.onresize = () => {
  state.screen.lg = window.innerWidth < 1024
  state.screen.md = window.innerWidth < 768
  state.screen.sm = window.innerWidth < 640
}
window.onresize()

export default state
