<template>
  <div class="detail-page" v-loading="loading">
    <template v-if="article">
      <el-card class="detail-card" shadow="never">
        <h1 class="title">{{ article.title }}</h1>
        <div class="meta">
          <el-avatar :size="40" class="avatar">{{ article.user?.username?.[0]?.toUpperCase() }}</el-avatar>
          <div class="meta-info">
            <span class="author">{{ article.user?.username }}</span>
            <span class="date">{{ formatDate(article.CreatedAt) }}</span>
          </div>
          <el-button
            v-if="isOwner"
            type="danger"
            size="small"
            plain
            :loading="deleting"
            @click="deleteArticle"
            class="del-btn"
          >删除文章</el-button>
        </div>
        <el-divider />
        <div class="content">{{ article.content }}</div>
      </el-card>

      <div class="back-btn">
        <el-button @click="$router.push('/')" size="large">← 返回首页</el-button>
      </div>
    </template>
    <el-empty v-else-if="!loading" description="文章不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { articleApi } from '../api'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(false)
const deleting = ref(false)

const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
const isOwner = computed(() => currentUser && article.value?.user_id === currentUser.id)

async function fetchArticle() {
  loading.value = true
  try {
    const res = await articleApi.get(route.params.id)
    article.value = res.data
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
}

async function deleteArticle() {
  await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
  deleting.value = true
  try {
    await articleApi.delete(route.params.id)
    ElMessage.success('删除成功')
    router.push('/')
  } finally {
    deleting.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString('zh-CN')
}

onMounted(fetchArticle)
</script>

<style scoped>
.detail-page { max-width: 800px; margin: 0 auto; }
.detail-card { border-radius: 16px !important; border: none !important; padding: 12px; }
.title { font-size: 32px; font-weight: 700; color: #2c3e50; line-height: 1.3; margin-bottom: 20px; }
.meta { display: flex; align-items: center; gap: 12px; }
.avatar { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-weight: 700; flex-shrink: 0; }
.meta-info { display: flex; flex-direction: column; gap: 2px; }
.author { font-weight: 600; color: #2c3e50; font-size: 15px; }
.date { color: #aaa; font-size: 13px; }
.del-btn { margin-left: auto; }
.content { font-size: 16px; line-height: 1.9; color: #34495e; white-space: pre-wrap; word-break: break-word; }
.back-btn { margin-top: 24px; }
</style>
