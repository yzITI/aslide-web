import { reactive } from 'vue'

export const SS = window.sessionStorage

export const state = reactive({
  loading: false,
  user: SS.user ? JSON.parse(SS.user) : null
})

export default state
