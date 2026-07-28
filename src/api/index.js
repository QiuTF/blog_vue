import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearAuth } from '../utils/auth'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

let isRedirectingToLogin = false
let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}`
}

function redirectToLogin() {
  clearAuth()

  if (window.location.pathname === '/login' || isRedirectingToLogin) return

  isRedirectingToLogin = true
  ElMessage.warning('登录已过期，请重新登录')

  const redirect = getCurrentPath()
  const query = redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''

  try {
    const navigation = unauthorizedHandler
      ? unauthorizedHandler(redirect)
      : window.location.replace(`/login${query}`)

    Promise.resolve(navigation)
      .catch(() => {
        window.location.replace(`/login${query}`)
      })
      .finally(() => {
        isRedirectingToLogin = false
      })
  } catch {
    isRedirectingToLogin = false
    window.location.replace(`/login${query}`)
  }
}

http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  res => {
    if (res.data.code !== 0) {
      ElMessage.error(res.data.message)
      return Promise.reject(res.data)
    }
    return res.data
  },
  err => {
    if (err.response?.status === 401) {
      redirectToLogin()
      return Promise.reject(err)
    }

    ElMessage.error(err.response?.data?.message || '网络错误')
    return Promise.reject(err)
  }
)

export const authApi = {
  register: data => http.post('/register', data),
  login: data => http.post('/login', data)
}

export const articleApi = {
  list: params => http.get('/articles', { params }),
  get: id => http.get(`/articles/${id}`),
  create: data => http.post('/articles', data),
  delete: id => http.delete(`/articles/${id}`)
}
