<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">✍️ Blog</router-link>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <template v-if="user">
            <router-link to="/publish">发布文章</router-link>
            <el-dropdown @command="handleCommand">
              <span class="user-name">
                <el-avatar :size="28" :src="user.avatar || ''" class="nav-avatar">{{ user.username?.[0]?.toUpperCase() }}</el-avatar>
                <span>{{ user.username }}</span>
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="myArticles">我的文章</el-dropdown-item>
                  <el-dropdown-item command="profile">我的资料</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </template>
        </nav>
      </div>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
    <el-footer class="footer">© 2026 Blog. All rights reserved.</el-footer>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { clearAuth, getToken, isTokenExpired } from './utils/auth'

const router = useRouter()
const user = ref(null)

function syncUser() {
  const token = getToken()
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
    return
  }

  const u = localStorage.getItem('user')
  user.value = u ? JSON.parse(u) : null
}

onMounted(syncUser)
window.addEventListener('storage', syncUser)
window.__refreshUser = syncUser

function handleCommand(cmd) {
  if (cmd === 'myArticles') {
    router.push('/my/articles')
    return
  }

  if (cmd === 'profile') {
    router.push('/profile')
    return
  }

  if (cmd === 'logout') {
    clearAuth()
    user.value = null
    router.push('/login')
  }
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; }
a { text-decoration: none; color: inherit; }

.layout { min-height: 100vh; }

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  position: sticky; top: 0; z-index: 100;
  height: 64px !important;
}
.header-inner {
  max-width: 1100px; margin: 0 auto;
  height: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
}
.logo { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 1px; }
.nav { display: flex; align-items: center; gap: 24px; }
.nav a { color: rgba(255,255,255,0.85); font-size: 15px; transition: color .2s; }
.nav a:hover, .nav a.router-link-active { color: #fff; }
.user-name { color: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 15px; }
.nav-avatar { background: rgba(255,255,255,0.24); color: #fff; font-weight: 700; }

.main { max-width: 1100px; margin: 0 auto; padding: 32px 20px; width: 100%; }

.footer {
  text-align: center; color: #999; font-size: 13px;
  background: #fff; border-top: 1px solid #eee;
  height: 50px !important; line-height: 50px !important;
}
</style>
