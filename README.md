# aslide-web

Frontend of ASlide

## Model

```js
slide {
  index: 0, // slide index
  title: 'slide show title',
  surl: 'slide url',
  eurl: 'editor url',
  data: {/* slide data */}
}
```

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

}

pluginMsgIn { // from ASlide to plugin

  // update slide
  slide: {/* slide object */},

  // ONLY for slide page
  session: 'current session id', // reply on ready

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
