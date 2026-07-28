<template>
  <div class="publish-page">
    <el-card class="publish-card" shadow="never">
      <div class="publish-header">
        <h2>✍️ 发布新文章</h2>
        <p>分享你的想法和知识</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" size="large">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题..." maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="文章摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="简短描述文章内容（可选）" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="16"
            placeholder="开始写作..."
            class="content-input"
          />
        </el-form-item>
        <el-form-item>
          <div class="btn-group">
            <el-button size="large" @click="$router.back()">取消</el-button>
            <el-button type="primary" size="large" :loading="loading" @click="submit" class="publish-btn">
              发布文章
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { articleApi } from '../api'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref({ title: '', summary: '', content: '' })
const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const res = await articleApi.create(form.value)
    ElMessage.success('发布成功！')
    router.push(`/article/${res.data.ID}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.publish-page { max-width: 800px; margin: 0 auto; }
.publish-card { border-radius: 16px !important; border: none !important; }
.publish-header { margin-bottom: 28px; }
.publish-header h2 { font-size: 26px; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.publish-header p { color: #7f8c8d; }
.content-input :deep(textarea) { font-size: 15px; line-height: 1.8; font-family: inherit; }
.btn-group { display: flex; gap: 12px; justify-content: flex-end; width: 100%; }
.publish-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: none; padding: 0 32px; }
</style>
