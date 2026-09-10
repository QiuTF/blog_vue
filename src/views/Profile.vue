<template>
  <div class="profile-page">
    <el-card class="profile-card" shadow="never" v-loading="loading">
      <div class="profile-hero">
        <div class="avatar-panel">
          <el-avatar :size="104" :src="form.avatar" class="profile-avatar">{{ initials }}</el-avatar>
          <el-button round class="change-avatar" @click="triggerFile">更换头像</el-button>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="handleFileChange" />
        </div>
        <div class="hero-copy">
          <p class="eyebrow">Account settings</p>
          <h2>我的资料</h2>
          <p>编辑你的公开用户名和头像，头像会在上传前裁剪成正方形。</p>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" class="profile-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" maxlength="50" show-word-limit placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" disabled />
        </el-form-item>
        <div class="form-actions">
          <el-button size="large" @click="$router.back()">取消</el-button>
          <el-button type="primary" size="large" class="save-btn" :loading="saving" @click="saveProfile">保存修改</el-button>
        </div>
      </el-form>
    </el-card>

    <el-dialog v-model="cropDialogVisible" title="裁剪头像" width="720px" class="crop-dialog" :close-on-click-modal="false">
      <div class="crop-body">
        <div class="crop-board">
          <canvas
            ref="cropCanvas"
            :width="cropSize"
            :height="cropSize"
            class="crop-canvas"
            @pointerdown="startDrag"
            @pointermove="dragCrop"
            @pointerup="stopDrag"
            @pointerleave="stopDrag"
            @wheel.prevent="zoomByWheel"
          />
        </div>
        <div class="crop-tools">
          <div>
            <p class="tool-title">拖动图片调整位置</p>
            <p class="tool-hint">滚轮或滑块可缩放，保存前会导出为正方形头像。</p>
          </div>
          <div class="preview-box">
            <el-avatar :size="96" :src="cropPreviewUrl" class="preview-avatar">{{ initials }}</el-avatar>
            <span>头像预览</span>
          </div>
          <div>
            <div class="slider-label">缩放</div>
            <el-slider v-model="scale" :min="minScale" :max="maxScale" :step="0.01" :show-tooltip="false" />
          </div>
          <el-button plain @click="resetCrop">重置裁剪</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="cropDialogVisible = false">取消</el-button>
        <el-button type="primary" class="save-btn" @click="applyCrop">使用头像</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '../api'

const cropSize = 320
const fileInput = ref()
const cropCanvas = ref()
const formRef = ref()
const loading = ref(false)
const saving = ref(false)
const cropDialogVisible = ref(false)
const cropPreviewUrl = ref('')
const avatarFile = ref(null)
const avatarObjectUrl = ref('')
const cropSourceUrl = ref('')
const scale = ref(1)
const minScale = ref(1)
const maxScale = ref(4)
const offset = reactive({ x: 0, y: 0 })
const imageSize = reactive({ width: 0, height: 0 })
const form = reactive({ username: '', email: '', avatar: '' })
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为 3-50 个字符', trigger: 'blur' }
  ]
}

let cropImage = null
let dragging = false
let lastPoint = { x: 0, y: 0 }

const initials = computed(() => form.username?.[0]?.toUpperCase() || 'U')

watch(scale, drawCrop)

onMounted(fetchProfile)
onBeforeUnmount(() => {
  revokeUrl(avatarObjectUrl.value)
  revokeUrl(cropSourceUrl.value)
})

async function fetchProfile() {
  loading.value = true
  try {
    const res = await userApi.profile()
    applyUser(res.data)
  } finally {
    loading.value = false
  }
}

function applyUser(user) {
  form.username = user.username || ''
  form.email = user.email || ''
  form.avatar = user.avatar || ''
  localStorage.setItem('user', JSON.stringify(user))
  window.__refreshUser?.()
}

function triggerFile() {
  fileInput.value?.click()
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 8MB')
    return
  }

  revokeUrl(cropSourceUrl.value)
  cropSourceUrl.value = URL.createObjectURL(file)

  const image = new Image()
  image.onload = async () => {
    cropImage = image
    imageSize.width = image.naturalWidth
    imageSize.height = image.naturalHeight
    minScale.value = Math.max(cropSize / imageSize.width, cropSize / imageSize.height)
    maxScale.value = minScale.value * 5
    scale.value = minScale.value
    offset.x = 0
    offset.y = 0
    cropDialogVisible.value = true
    await nextTick()
    drawCrop()
  }
  image.onerror = () => ElMessage.error('图片读取失败，请重新选择')
  image.src = cropSourceUrl.value
}

function drawCrop() {
  const canvas = cropCanvas.value
  if (!canvas || !cropImage) return

  clampOffset()
  const ctx = canvas.getContext('2d')
  const rect = getDrawRect()

  ctx.clearRect(0, 0, cropSize, cropSize)
  ctx.fillStyle = '#f2f4f8'
  ctx.fillRect(0, 0, cropSize, cropSize)
  ctx.drawImage(cropImage, rect.x, rect.y, rect.width, rect.height)

  cropPreviewUrl.value = canvas.toDataURL('image/jpeg', 0.86)
}

function getDrawRect() {
  const width = imageSize.width * scale.value
  const height = imageSize.height * scale.value
  return {
    x: (cropSize - width) / 2 + offset.x,
    y: (cropSize - height) / 2 + offset.y,
    width,
    height
  }
}

function clampOffset() {
  const width = imageSize.width * scale.value
  const height = imageSize.height * scale.value
  const limitX = Math.max(0, (width - cropSize) / 2)
  const limitY = Math.max(0, (height - cropSize) / 2)
  offset.x = Math.min(limitX, Math.max(-limitX, offset.x))
  offset.y = Math.min(limitY, Math.max(-limitY, offset.y))
}

function startDrag(event) {
  if (!cropImage) return
  dragging = true
  lastPoint = { x: event.clientX, y: event.clientY }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function dragCrop(event) {
  if (!dragging) return
  const ratio = cropSize / event.currentTarget.getBoundingClientRect().width
  offset.x += (event.clientX - lastPoint.x) * ratio
  offset.y += (event.clientY - lastPoint.y) * ratio
  lastPoint = { x: event.clientX, y: event.clientY }
  drawCrop()
}

function stopDrag(event) {
  dragging = false
  if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

function zoomByWheel(event) {
  const factor = event.deltaY < 0 ? 1.08 : 0.92
  scale.value = Math.min(maxScale.value, Math.max(minScale.value, scale.value * factor))
}

function resetCrop() {
  scale.value = minScale.value
  offset.x = 0
  offset.y = 0
  drawCrop()
}

function applyCrop() {
  const canvas = cropCanvas.value
  if (!canvas) return

  canvas.toBlob(blob => {
    if (!blob) {
      ElMessage.error('头像裁剪失败，请重试')
      return
    }

    avatarFile.value = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    revokeUrl(avatarObjectUrl.value)
    avatarObjectUrl.value = URL.createObjectURL(blob)
    form.avatar = avatarObjectUrl.value
    cropDialogVisible.value = false
  }, 'image/jpeg', 0.92)
}

async function saveProfile() {
  await formRef.value.validate()
  saving.value = true
  try {
    const data = new FormData()
    data.append('username', form.username.trim())
    if (avatarFile.value) data.append('avatar', avatarFile.value)

    const res = await userApi.updateProfile(data)
    avatarFile.value = null
    revokeUrl(avatarObjectUrl.value)
    avatarObjectUrl.value = ''
    applyUser(res.data)
    ElMessage.success('资料已更新')
  } finally {
    saving.value = false
  }
}

function revokeUrl(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}
</script>

<style scoped>
.profile-page { max-width: 860px; margin: 0 auto; }
.profile-card { border: none !important; border-radius: 22px !important; overflow: hidden; }
.profile-hero {
  display: grid; grid-template-columns: 180px 1fr; gap: 28px; align-items: center;
  padding: 32px; margin: -1px -1px 28px;
  background: radial-gradient(circle at 12% 20%, #ffffff55, transparent 28%), linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.avatar-panel { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.profile-avatar { border: 4px solid rgba(255,255,255,0.62); background: rgba(255,255,255,0.18); color: #fff; font-size: 36px; font-weight: 800; }
.change-avatar { color: #5a4fcf; border: none; font-weight: 700; }
.hero-copy .eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 12px; opacity: 0.75; margin-bottom: 8px; }
.hero-copy h2 { font-size: 34px; line-height: 1.1; margin-bottom: 10px; }
.hero-copy p { max-width: 460px; color: rgba(255,255,255,0.82); line-height: 1.7; }
.profile-form { padding: 0 32px 32px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.save-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: none; padding-left: 28px; padding-right: 28px; }
.crop-body { display: grid; grid-template-columns: 320px 1fr; gap: 28px; align-items: stretch; }
.crop-board { position: relative; width: 320px; height: 320px; border-radius: 22px; overflow: hidden; background: #f2f4f8; box-shadow: inset 0 0 0 1px #dde3ee; touch-action: none; }
.crop-canvas { width: 320px; height: 320px; display: block; cursor: grab; }
.crop-canvas:active { cursor: grabbing; }
.crop-tools { display: flex; flex-direction: column; justify-content: space-between; gap: 22px; min-width: 0; }
.tool-title { font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.tool-hint { color: #7f8c8d; font-size: 14px; line-height: 1.7; }
.preview-box { display: flex; align-items: center; gap: 16px; color: #7f8c8d; }
.preview-avatar { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 30px; font-weight: 800; }
.slider-label { color: #2c3e50; font-weight: 700; margin-bottom: 6px; }

@media (max-width: 720px) {
  .profile-hero { grid-template-columns: 1fr; text-align: center; padding: 28px 20px; }
  .hero-copy p { margin: 0 auto; }
  .profile-form { padding: 0 20px 24px; }
  .crop-body { grid-template-columns: 1fr; }
  .crop-board { width: min(320px, 100%); height: auto; aspect-ratio: 1; margin: 0 auto; }
  .crop-canvas { width: 100%; height: 100%; }
}
</style>
