<template>
  <div class="my-articles-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">My posts</p>
        <h2>我的文章</h2>
        <p>查看、编辑或删除你发布过的文章。</p>
      </div>
      <el-button type="primary" size="large" class="write-btn" @click="$router.push('/publish')">写新文章</el-button>
    </div>

    <el-card class="article-panel" shadow="never" v-loading="loading">
      <el-empty v-if="!loading && articles.length === 0" description="你还没有发布文章" />
      <div v-else class="article-list">
        <article v-for="article in articles" :key="article.ID" class="article-row">
          <div class="article-main" @click="$router.push(`/article/${article.ID}`)">
            <div class="row-meta">
              <span>{{ formatDate(article.CreatedAt) }}</span>
              <span>{{ article.content?.length || 0 }} 字</span>
            </div>
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || article.content?.slice(0, 120) || '暂无摘要' }}</p>
          </div>
          <div class="row-actions">
            <el-button plain @click="$router.push(`/article/${article.ID}/edit`)">编辑</el-button>
            <el-button type="danger" plain :loading="deletingId === article.ID" @click="deleteArticle(article)">删除</el-button>
          </div>
        </article>
      </div>

      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchArticles"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleApi, userApi } from '../api'

const articles = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 8
const loading = ref(false)
const deletingId = ref(null)

onMounted(fetchArticles)

async function fetchArticles() {
  loading.value = true
  try {
    const res = await userApi.myArticles({ page: page.value, size: pageSize })
    articles.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

async function deleteArticle(article) {
  await ElMessageBox.confirm(`确定要删除《${article.title}》吗？`, '删除文章', { type: 'warning' })
  deletingId.value = article.ID
  try {
    await articleApi.delete(article.ID)
    ElMessage.success('删除成功')
    if (articles.value.length === 1 && page.value > 1) page.value -= 1
    await fetchArticles()
  } finally {
    deletingId.value = null
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.my-articles-page { max-width: 920px; margin: 0 auto; }
.page-header {
  display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;
  padding: 32px; margin-bottom: 24px; border-radius: 20px;
  background: radial-gradient(circle at 90% 10%, #ffffff80, transparent 26%), linear-gradient(135deg, #667eea22, #764ba222);
}
.eyebrow { text-transform: uppercase; letter-spacing: 2px; color: #667eea; font-size: 12px; font-weight: 800; margin-bottom: 8px; }
.page-header h2 { font-size: 32px; color: #2c3e50; margin-bottom: 8px; }
.page-header p { color: #7f8c8d; }
.write-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: none; flex-shrink: 0; }
.article-panel { border: none !important; border-radius: 18px !important; }
.article-list { display: flex; flex-direction: column; gap: 14px; }
.article-row {
  display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center;
  padding: 20px; border: 1px solid #edf0f6; border-radius: 16px; background: #fff;
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.article-row:hover { transform: translateY(-2px); border-color: #dfe4ff; box-shadow: 0 10px 26px rgba(102,126,234,0.10); }
.article-main { min-width: 0; cursor: pointer; }
.row-meta { display: flex; gap: 14px; color: #a0a7b3; font-size: 13px; margin-bottom: 8px; }
.article-main h3 { color: #2c3e50; font-size: 19px; line-height: 1.35; margin-bottom: 8px; }
.article-main p { color: #7f8c8d; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.row-actions { display: flex; gap: 10px; }
.pagination { display: flex; justify-content: center; margin-top: 28px; }

@media (max-width: 720px) {
  .page-header { align-items: stretch; flex-direction: column; padding: 24px; }
  .article-row { grid-template-columns: 1fr; }
  .row-actions { justify-content: flex-end; }
}
</style>
