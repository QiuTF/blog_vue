<template>
  <div class="edit-page" v-loading="loading">
    <el-card class="edit-card" shadow="never">
      <div class="edit-header">
        <p class="eyebrow">Edit post</p>
        <h2>编辑文章</h2>
        <p>更新标题、摘要和正文内容。</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" size="large">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题..." maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="文章摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="简短描述文章内容（可选）" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="16" placeholder="开始写作..." class="content-input" />
        </el-form-item>
        <el-form-item>
          <div class="btn-group">
            <el-button size="large" @click="$router.back()">取消</el-button>
            <el-button type="primary" size="large" :loading="saving" @click="submit" class="save-btn">保存修改</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { articleApi } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const loading = ref(false)
const saving = ref(false)
const form = ref({ title: '', summary: '', content: '' })
const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

onMounted(fetchArticle)

async function fetchArticle() {
  loading.value = true
  try {
    const res = await articleApi.get(route.params.id)
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!currentUser || res.data.user_id !== currentUser.id) {
      ElMessage.warning('只能编辑自己的文章')
      router.replace('/my/articles')
      return
    }
    form.value = {
      title: res.data.title || '',
      summary: res.data.summary || '',
      content: res.data.content || ''
    }
  } finally {
    loading.value = false
  }
}

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await articleApi.update(route.params.id, form.value)
    ElMessage.success('保存成功')
    router.push(`/article/${route.params.id}`)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-page { max-width: 820px; margin: 0 auto; }
.edit-card { border: none !important; border-radius: 18px !important; padding: 10px; }
.edit-header { margin-bottom: 28px; padding: 12px 4px 0; }
.eyebrow { text-transform: uppercase; letter-spacing: 2px; color: #667eea; font-size: 12px; font-weight: 800; margin-bottom: 8px; }
.edit-header h2 { font-size: 28px; color: #2c3e50; margin-bottom: 6px; }
.edit-header p { color: #7f8c8d; }
.content-input :deep(textarea) { font-size: 15px; line-height: 1.8; font-family: inherit; }
.btn-group { display: flex; gap: 12px; justify-content: flex-end; width: 100%; }
.save-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: none; padding: 0 32px; }
</style>
