import { Peer } from 'peerjs'
import { reactive } from 'vue'

let peer = null, interval = null, conn = null

export const state = reactive({
  id: false,
  on: false,
  time: 0,
  host: false, // host id
  peer: false, // connected id
  slide: null,
  message: null
})

const base64url = s => window.btoa(s).replaceAll('=', '').replace('+', '-').replace('/', '_')

const random = () => Math.random().toString(36).substring(2)

const sleep = ms => new Promise(r => setTimeout(r, ms))

export const getPeer = () => peer

export function start (channel, opt = { host: 's.yzzx.org', path: '/peerjs', secure: true }) {
  state.id = ''
  state.on = true
  state.time = 0
  if (peer) peer.destroy()
  peer = new Peer(random() + random(), opt)
  peer.on('error', e => {
    console.log('[Peer] Error: ' + e.type)
    switch (e.type) {
      case 'browser-incompatible':
        Swal.fire('Error', 'Incompatible Browser', 'error')
        break
      case 'server-error':
        Swal.fire('Error', 'Cannot reach the Peer Server', 'error')
        break
      case 'peer-unavailable': // todo
        console.log('[Peer] Reconnecting to host')
        if (state.host) connect()
        break
      case 'unavailable-id': // not possible by chance
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
  peer.on('open', id => {
    state.id = id
    if (state.host) connect()
  })
  if (!interval) interval = setInterval(() => { // auto delete dead connections
    const conns = peer?.connections
    if (!conns) return
    for (const k in conns) {
      for (const c of conns[k]) {
        if (c?.peerConnection?.iceConnectionState === 'disconnected') c.close()
      }
    }
  }, 5e3)
}

export function stop () {
  state.on = false
  clearInterval(interval)
  interval = null
  state.time = 0
  state.slide = null
  if (!peer) return
  peer.destroy()
}

export function connect (channel) {
  if (channel) state.host = `ASLIDE-${base64url(channel)}-HOST`
  if (!state.host || !peer.open) return
  if (conn) conn.close()
  conn = peer.connect(state.host)
  conn.on('open', () => { state.peer = conn.peer })
  conn.on('close', async () => {
    state.peer = false
    await sleep(100) // wait for conn object
    if (conn.open || !state.host) return
    console.log('[Peer] Disconnected from peer, reconnect in 5s')
    setTimeout(() => {
      if (!conn.open && state.host) connect()
    }, 5e3)
  })
  conn.on('data', handle)
  return conn
}

export function close () {
  state.host = ''
  if (conn) conn.close()
}

function handle (d) {
  state.time = Date.now()
  if (typeof d.slide !== 'undefined') state.slide = d.slide
  if (typeof d.message !== 'undefined') state.message = d.message
}

export function session (data) {
  if (!conn?.open) return
  conn.send({ session: data })
}

export function response (data) {
  if (!conn?.open) return
  conn.send({ response: data })
}
