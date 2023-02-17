# ASlide

a P2P Realtime Slideshow Platform based on WebRTC.

## Communication

The following data are transferred between host and viewers using WebRTC:

- `session { index, on, name }`: (viewer -> host) the session info and status of the viewer
- `slide { index, title, surl, data }`: (host -> viewers) the broadcasted data of current slide
- `response`: (viewer -> host) the response data
- `message`: (host -> viewer) the direct data to particular viewers

## Plugin Development

Plugins of slides and editors can be any urls that are embedded using 

```html
<iframe sandbox="allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-scripts allow-same-origin"></iframe>
```

It could interact with ASlide framework through `window.postMessage` transferring **JSON string** of objects, with the following protocol:

```js
pluginMsgOut { // from plugin to ASlide

  // must be sent first
  ready: 1, // start listening

  // ONLY for slide page:
  response: {/* resp object */}, // submit resp

  // ONLY for editor page:
  slide: {/* slide object */} // update slide
  messages: { // direct message to viewer
    [session]: {/* message object */},
    ...
  }
}

pluginMsgIn { // from ASlide to plugin

  // update slide
  slide: {/* slide object */},

  // ONLY for slide page
  session: 'current session id', // reply on ready
  message: {/* message object */}, // direct message from host

  // ONLY for editor page:
  responses: { // full update
    [session]: {/* resp object */},
    ...
  },
  sessions: { // full update
    [session]: {/* session info */},
    ...
  }
}
```
