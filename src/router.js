import { createRouter, createWebHashHistory } from 'vue-router'

const index = {
  '/view/:id': () => import('./views/View.vue'),
  '/host/:id': () => import('./views/Host.vue'),
  '/home': () => import('./views/Home.vue'),
  '/login': () => import('./views/Login.vue'),
  '/test/host': () => import('./views/TestHost.vue'),
  '/test/view': () => import('./views/TestView.vue'),
  '/': () => import('./views/Entry.vue'),

  '/plugins/html-editor': () => import('./plugins/HTMLEditor.vue'),
  '/plugins/rich-text': () => import('./plugins/RichText.vue'),
  '/plugins/rich-text-editor': () => import('./plugins/RichTextEditor.vue'),
  '/plugins/choice': () => import('./plugins/Choice.vue'),
  '/plugins/choice-editor': () => import('./plugins/ChoiceEditor.vue')
}

const routes = []
for (const r in index) routes.push({ path: r, component: index[r] })
const router = createRouter({ history: createWebHashHistory(), routes }) 

router.beforeEach(() => { NProgress.start() })

let wsM = null
router.afterEach(async (to, from) => {
  Swal.close()
  NProgress.done()
  if (from.path.indexOf('/host/') === 0 || from.path.indexOf('/view/') === 0) {
    if (!wsM) wsM = await import('./ws.js')
    wsM.default.call('view.leave') // leave channel
  }
})

export default router