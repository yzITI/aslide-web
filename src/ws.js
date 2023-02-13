let blockReconnect = false, last = Date.now()

const sleep = ms => new Promise(r => setTimeout(r, ms))

const ws = {
  socket: null,
  session: '',
  url: 'wss://s.yzzx.org/aslide/ws',
  async connect (url) {
    if (!url && ws.socket?.readyState === 1) return
    if (url) ws.url = url
    if (ws.socket) { // close current connection
      blockReconnect = true
      ws.socket.close()
      await sleep(1000)
    }
    ws.socket = new WebSocket(ws.url)
    blockReconnect = false
    const reconnect = () => {
      if (blockReconnect) return
      ws.session = ''
      ws.socket = null
      blockReconnect = true
      console.log('[WS] connection lost, try to reconnect after 5s')
      setTimeout(() => { ws.connect() }, 5000)
    }
    ws.socket.onclose = reconnect
    ws.socket.onerror = reconnect
    ws.socket.onopen = () => { console.log('[WS] connected') }
    ws.socket.onmessage = e => {
      const data = JSON.parse(e.data)
      if (data.session) ws.session = data.session
      ws.handle(data)
    }
  },
  call (N, ...A) {
    if (ws.socket?.readyState !== 1) return
    last = Date.now()
    ws.socket.send(JSON.stringify({ N, A }))
  },
  handle: msg => {
    console.log('[WS] msg:', msg)
  }
}

function heartbeat () {
  if (Date.now() - last > 29e3) {
    if (ws.socket) ws.socket.send('')
    last = Date.now()
  }
  setTimeout(heartbeat, 30e3 - Date.now() + last)
}

ws.connect()
heartbeat()

export default ws
