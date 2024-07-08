import { Peer } from 'peerjs'
import { reactive } from 'vue'
import iceServers from './iceServers.js'

let peer = null, interval = null

const defaultOpt = {
  host: 's.yzzx.org', path: '/peerjs', secure: true,
  config: { iceServers, sdpSemantics: 'unified-plan' }
}

export const state = reactive({
  id: false,
  on: false,
  time: 0,
  slide: null,
  sessions: {},
  responses: {}
})

export const handles = {}

const base64url = s => window.btoa(s).replaceAll('=', '').replace('+', '-').replace('/', '_')
const sleep = ms => new Promise(r => setTimeout(r, ms))

export const getPeer = () => peer

export function start (channel, opt = defaultOpt) {
  state.id = ''
  state.on = true
  if (peer) peer.destroy()
  peer = new Peer(`ASLIDE-${base64url(channel)}-HOST`, opt)
  peer.on('error', e => {
    console.log('[Peer] Error: ' + e.type)
    switch (e.type) {
      case 'browser-incompatible':
        Swal.fire('Error', 'Incompatible Browser', 'error')
        break
      case 'server-error':
        Swal.fire('Error', 'Cannot reach the Peer Server', 'error')
        break
      case 'peer-unavailable': // host makes no connection
        break
      case 'unavailable-id':
        Swal.fire('Error', 'Channel Occupied', 'error')
        break
      case 'invalid-id':
      case 'invalid-key':
      case 'disconnected':
      case 'network':
      case 'webrtc':
      case 'socket-error':
      case 'socket-closed':
      case 'ssl-unavailable':
        break
    }
  })
  peer.on('disconnected', async () => {
    state.id = ''
    await sleep(100) // wait for peer object
    if (!peer.disconnected || peer.destroyed) return
    console.log('[Peer] Disconnected from server, reconnect in 5s')
    setTimeout(() => {
      if (peer.disconnected && !peer.destroyed) peer.reconnect()
    }, 5e3)
  })
  peer.on('connection', conn => {
    conn.on('open', () => {
      state.sessions[conn.peer] = {}
      if (handles.sessions) handles.sessions({ [conn.peer]: {} })
      conn.send({ slide: state.slide })
    })
    conn.on('close', () => {
      delete state.sessions[conn.peer]
      if (handles.sessions) handles.sessions({ [conn.peer]: null })
    })
    conn.on('data', d => { handle(d, conn.peer) })
  })
  peer.on('open', id => {
    state.time = Date.now()
    state.id = id
  })
  if (!interval) interval = setInterval(() => { // auto delete dead connections
    const conns = peer?.connections
    if (!conns) return
    for (const k in conns) {
      for (const c of conns[k]) {
        if (c?.peerConnection?.iceConnectionState === 'disconnected') c.close()
      }
    }
  }, 3e3)
}

export function stop () {
  state.on = false
  clearInterval(interval)
  interval = null
  state.time = 0
  state.slide = null
  state.sessions = {}
  state.responses = {}
  if (!peer) return
  peer.destroy()
}

function handle (d, peer) {
  state.time = Date.now()
  if (d.response) {
    state.responses[peer] = d.response
    if (handles.responses) handles.responses({ [peer]: d.response })
  }
  if (d.session) {
    state.sessions[peer] = d.session
    if (handles.sessions) handles.sessions({ [peer]: d.session })
  }
}

export function slide (data) {
  const conns = peer?.connections
  if (state.slide && state.slide.index !== data?.index) {
    state.responses = {} // clear response when changing slide
  }
  state.slide = data
  if (!conns) return
  for (const k in conns) { // broadcast
    for (const c of conns[k]) {
      c.send({ slide: data })
    }
  }
}

export function messages (data) {
  const conns = peer?.connections
  if (!conns) return
  for (const k in data) {
    if (!conns[k]) continue
    for (const c of conns[k]) {
      c.send({ message: data[k] })
    }
  }
}
