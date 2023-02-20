import { createRouter, createWebHashHistory } from 'vue-router'

const index = {
  '/view/:id': () => import('./views/View.vue'),
  '/host/:id': () => import('./views/Host.vue'),
  '/home': () => import('./views/Home.vue'),
  '/login': () => import('./views/Login.vue'),
  '/': () => import('./views/Entry.vue'),

  '/plugins/html-editor': () => import('./plugins/HTMLEditor.vue'),
  '/plugins/rich-text': () => import('./plugins/RichText.vue'),
  '/plugins/rich-text-editor': () => import('./plugins/RichTextEditor.vue'),
  '/plugins/choice': () => import('./plugins/Choice.vue'),
  '/plugins/choice-editor': () => import('./plugins/ChoiceEditor.vue'),
  '/plugins/chat': () => import('./plugins/Chat.vue'),
  '/plugins/chat-editor': () => import('./plugins/ChatEditor.vue')
}

const routes = []
for (const r in index) routes.push({ path: r, component: index[r] })
const router = createRouter({ history: createWebHashHistory(), routes }) 

router.beforeEach(() => { NProgress.start() })

let host = null, view = null
router.afterEach(async (to, from) => {
  Swal.close()
  NProgress.done()
  if (from.path.indexOf('/host/') === 0) {
    if (!host) host = await import('./utils/peerHost.js')
    host.stop()
  }
  if (from.path.indexOf('/view/') === 0) {
    if (!view) view = await import('./utils/peerView.js')
    view.stop()
  }
})

export default router