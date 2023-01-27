import { createRouter, createWebHashHistory } from 'vue-router'
import ws from './ws.js'

const index = {
  '/@/:id': () => import('./views/View.vue'),
  '/home': () => import('./views/Home.vue'),
  '/host/:id': () => import('./views/Host.vue'),
  '/': () => import('./views/Entry.vue')
}

const routes = []
for (const r in index) routes.push({ path: r, component: index[r] })
const router = createRouter({ history: createWebHashHistory(), routes }) 

router.beforeEach(() => { NProgress.start() })
router.afterEach(() => {
  Swal.close()
  NProgress.done()
  ws.call('view.leave')
})

export default router