import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api'

setUnauthorizedHandler(redirect => router.replace({
  path: '/login',
  query: redirect && redirect !== '/' ? { redirect } : {}
}))

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
