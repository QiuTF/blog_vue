import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import Publish from '../views/Publish.vue'
import Profile from '../views/Profile.vue'
import MyArticles from '../views/MyArticles.vue'
import EditArticle from '../views/EditArticle.vue'
import { clearAuth, getToken, isTokenExpired } from '../utils/auth'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/article/:id', component: ArticleDetail },
  { path: '/publish', component: Publish, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/my/articles', component: MyArticles, meta: { requiresAuth: true } },
  { path: '/article/:id/edit', component: EditArticle, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = getToken()
    if (!token || isTokenExpired(token)) {
      clearAuth()
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
