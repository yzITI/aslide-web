import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './index.css'
import './ws.js' // start websocket

createApp(App).use(router).mount('#app')
