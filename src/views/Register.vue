<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <div class="auth-header">
        <div class="auth-icon">🚀</div>
        <h2>创建账号</h2>
        <p>加入我们，开始你的创作之旅</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名（3-50字符）" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="submit">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', email: '', password: '' })
const rules = {
  username: [{ required: true, min: 3, max: 50, message: '用户名3-50字符', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await authApi.register(form.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
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
