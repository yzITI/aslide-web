import { reactive } from 'vue'

function getSS () {
  try { return window.sessionStorage }
  catch { return {} }
}

export const SS = getSS()

export const state = reactive({
  loading: false,
  user: SS.user ? JSON.parse(SS.user) : null
})

export default state
