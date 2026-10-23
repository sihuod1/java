<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isAdminLoggedIn, saveAdminLogin, clearAdminLogin } from '../utils/adminAuth'
import { API_BASE } from '../config'

const router = useRouter()
const username = ref('')
const password = ref('')
const hint = ref('')
const hintType = ref('') // '' | 'error' | 'success'
const submitting = ref(false)

onMounted(() => {
  // 已登录的直接进后台
  if (isAdminLoggedIn()) router.replace({ name: 'admin' })
})

async function onLogin() {
  hint.value = ''
  if (!username.value.trim() || !password.value) {
    hint.value = '请输入管理员账号和密码'
    hintType.value = 'error'
    return
  }
  submitting.value = true
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    })
    const json = await res.json()
    if (res.status === 401) {
      // 管理员登录过期等：清掉旧登录态让用户重登
      clearAdminLogin()
    }
    if (!res.ok || json.code !== 0) {
      hint.value = json.message || '登录失败，请稍后再试'
      hintType.value = 'error'
      return
    }
    saveAdminLogin(json.data.token, {
      username: json.data.username,
      nickName: json.data.nickName
    })
    hint.value = '登录成功，正在进入后台…'
    hintType.value = 'success'
    setTimeout(() => router.replace({ name: 'admin' }), 300)
  } catch (e) {
    hint.value = '无法连接服务器，请确认后端已启动'
    hintType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-card">
    <div class="logo">
      <!-- 盾牌图标（后台管理） -->
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path
          d="M32 6l20 7v16c0 13.5-8.5 24.5-20 29-11.5-4.5-20-15.5-20-29V13l20-7z"
          stroke="#f7d774"
          stroke-width="3"
          fill="rgba(247,215,116,0.08)" />
        <path
          d="M22 32l7 7 13-14"
          stroke="#f7d774"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
      <h1>后台管理系统</h1>
      <p>ADMIN CONSOLE · GOLDEN SPATULA</p>
    </div>

    <!-- 后台只有登录，不提供注册入口 -->
    <form @submit.prevent="onLogin">
      <div class="field plain">
        <label>管理员账号</label>
        <input v-model="username" type="text" autocomplete="username" placeholder="请输入管理员账号" />
      </div>
      <div class="field plain">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" />
      </div>

      <p class="form-hint" :class="{ 'is-error': hintType === 'error', 'is-success': hintType === 'success' }">
        {{ hint }}
      </p>

      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? '登录中…' : '登 录' }}
      </button>
    </form>

    <div class="divider">仅限管理员</div>

    <p class="foot">
      <a href="#/">← 返回首页</a>
      <span style="margin: 0 8px; opacity: 0.4">·</span>
      <a href="#/login">前台登录</a>
    </p>
  </div>
</template>
