let retry = false, last = Date.now()

const ws = {
  socket: null,
  session: '',
  url: 'wss://s.yzzx.org/aslide/ws',
  connect () {
    retry = false
    ws.socket = new WebSocket(ws.url)
    const reconnect = () => {
      if (retry) return
      ws.session = ''
      retry = true
      console.log('[WS] connection lost, try to reconnect after 5s')
      setTimeout(ws.connect, 5000)
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
    if (!ws.socket) return
    last = Date.now()
    ws.socket.send(JSON.stringify({ N, A }))
  },
  handle: msg => {
    console.log('[WS] msg:', msg)
  }
}

function heartbeat () {
  if (Date.now() - last > 29e3) {
    if (ws.socket) ws.socket.send('heartbeat')
    last = Date.now()
  }
  setTimeout(heartbeat, 30e3 - Date.now() + last)
}

ws.connect()
heartbeat()

export default ws
