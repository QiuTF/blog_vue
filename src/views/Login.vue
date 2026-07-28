<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <div class="auth-header">
        <div class="auth-icon">🔐</div>
        <h2>欢迎回来</h2>
        <p>登录你的账号继续创作</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="submit">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function getSafeRedirect(redirect) {
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const res = await authApi.login(form.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    window.__refreshUser?.()
    ElMessage.success('登录成功')
    router.push(getSafeRedirect(route.query.redirect))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.auth-card { width: 420px; border-radius: 16px !important; padding: 12px; }
.auth-header { text-align: center; margin-bottom: 28px; }
.auth-icon { font-size: 48px; margin-bottom: 12px; }
.auth-header h2 { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.auth-header p { color: #7f8c8d; font-size: 14px; }
.submit-btn { width: 100%; height: 46px; font-size: 16px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; }
.submit-btn:hover { opacity: 0.9; }
.auth-footer { text-align: center; color: #7f8c8d; font-size: 14px; margin-top: 16px; }
.auth-footer a { color: #667eea; font-weight: 600; }
</style>
