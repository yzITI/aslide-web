let retry = false

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
  send (data) {
    if (!ws.socket) return
    ws.socket.send(JSON.stringify(data))
  },
  handle: msg => {
    console.log('[WS] msg:', msg)
  }
}

ws.connect()

setInterval(() => { ws.socket.send('heartbeat') }, 30e3)

export default ws
