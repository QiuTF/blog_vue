<template>
  <div>
    <div class="hero">
      <h1>探索精彩文章</h1>
      <p>分享知识，记录生活，连接世界</p>
    </div>

    <div v-loading="loading" class="article-grid">
      <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />
      <el-card
        v-for="a in articles" :key="a.ID"
        class="article-card"
        shadow="hover"
        @click="$router.push(`/article/${a.ID}`)"
      >
        <div class="card-meta">
          <el-avatar :size="32" class="avatar">{{ a.user?.username?.[0]?.toUpperCase() }}</el-avatar>
          <span class="author">{{ a.user?.username }}</span>
          <span class="date">{{ formatDate(a.CreatedAt) }}</span>
        </div>
        <h3 class="card-title">{{ a.title }}</h3>
        <p class="card-summary">{{ a.summary || a.content?.slice(0, 100) }}...</p>
        <div class="card-footer">
          <el-tag size="small" type="info">阅读全文 →</el-tag>
        </div>
      </el-card>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articleApi } from '../api'

const articles = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 9
const loading = ref(false)

async function fetchArticles() {
  loading.value = true
  try {
    const res = await articleApi.list({ page: page.value, size: pageSize })
    articles.value = res.data.list || []
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}

onMounted(fetchArticles)
</script>

<style scoped>
.hero {
  text-align: center; padding: 48px 20px 40px;
  background: linear-gradient(135deg, #667eea22, #764ba222);
  border-radius: 16px; margin-bottom: 36px;
}
.hero h1 { font-size: 36px; font-weight: 700; color: #2c3e50; margin-bottom: 10px; }
.hero p { font-size: 16px; color: #7f8c8d; }

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
.article-card { cursor: pointer; border-radius: 12px !important; transition: transform .2s; }
.article-card:hover { transform: translateY(-4px); }

.card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.avatar { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-weight: 600; }
.author { font-weight: 600; color: #2c3e50; font-size: 14px; }
.date { color: #aaa; font-size: 13px; margin-left: auto; }

.card-title { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 10px; line-height: 1.4; }
.card-summary { color: #7f8c8d; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
.card-footer { display: flex; justify-content: flex-end; }

.pagination { display: flex; justify-content: center; margin-top: 40px; }
</style>
