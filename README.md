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

## Slide Development

Slide and editor urls are embedded using 

```html
<iframe sandbox="allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-scripts allow-same-origin"></iframe>
```

It will interact with ASlide framework through `window.postMessage` transferring **JSON string** of objects, with the following protocol:

```js
iframeMsgOut { // from iframe to ASlide
  // must be sent first
  ready: 1, // start listening

  // ONLY for slide:
  response: {/* resp object */}, // submit resp

  // ONLY for editor:
  slide: {/* slide object */} // update slide
}

iframeMsgIn {
  slide: {/* slide object */}, // update slide
  // ONLY for editor:
  responses: { // incremental update
    [session]: {/* resp object */},
    ...
  },
  sessions: { // incremental update
    [session]: {/* session info */},
    ...
  }
}
```
