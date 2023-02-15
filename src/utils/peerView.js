import { Peer } from 'peerjs'
import { reactive } from 'vue'

let peer = null, interval = null

export const state = reactive({
  id: false,
  on: false,
  host: false, // host id
  slide: null
})

const base64url = s => window.btoa(s).replaceAll('=', '').replace('+', '-').replace('/', '_')

const random = () => Math.random().toString(36).substring(2)

const sleep = ms => new Promise(r => setTimeout(r, ms))

export const getPeer = () => peer

export function start (channel, server = '0.peerjs.com') {
  state.id = ''
  state.on = true
  if (peer) peer.destroy()
  peer = new Peer(`ASLIDE-${random()}-VIEW`, { host: server })
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
    console.log('[Peer] Disconnected, reconnect in 5s')
    setTimeout(() => {
      if (peer.disconnected && !peer.destroyed) peer.reconnect()
    }, 5e3)
  })
  peer.on('open', id => { state.id = id })
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
  if (!peer) return
  peer.destroy()
}

export function connect (channel) {
  if (!peer.open) return
  const conn = peer.connect(`ASLIDE-${base64url(channel)}-HOST`)
  conn.on('open', () => { state.host = conn.peer })
  conn.on('close', () => { // todo: reconnect
    state.host = false
  })
  conn.on('data', d => {
    console.log('[Peer] Data: ', d)
  })
  return conn
}
