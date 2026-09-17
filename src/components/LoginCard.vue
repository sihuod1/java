<script setup>
import { ref } from 'vue'
import '../styles/login.css'

const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

function onLogin() {
  if (loading.value) return
  loading.value = true
  // 模拟登录请求，1.2s 后恢复
  setTimeout(() => {
    loading.value = false
  }, 1200)
}
</script>

<template>
  <div class="card">
    <div class="logo">
      <!-- 金色铲铲图标 -->
      <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff4cf" />
            <stop offset="0.55" stop-color="#e0a93b" />
            <stop offset="1" stop-color="#b87a1e" />
          </linearGradient>
        </defs>
        <!-- 铲面 -->
        <rect x="14" y="8" width="36" height="26" rx="8" fill="url(#g)" stroke="#7a4f12" stroke-width="1.5" />
        <rect x="20" y="13" width="24" height="16" rx="5" fill="#fff4cf" opacity="0.55" />
        <!-- 铲柄 -->
        <rect x="29" y="32" width="6" height="22" rx="3" fill="url(#g)" stroke="#7a4f12" stroke-width="1.2" />
        <!-- 底部圆头 -->
        <circle cx="32" cy="56" r="5" fill="url(#g)" stroke="#7a4f12" stroke-width="1.2" />
      </svg>
      <h1>金铲铲之战</h1>
      <p>GOLDEN SPATULA</p>
    </div>

    <form @submit.prevent>
      <div class="field">
        <svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-9 2-9 6v2h18v-2c0-4-5-6-9-6Z" /></svg>
        <input v-model="username" type="text" placeholder="账号 / 手机号" autocomplete="username" />
      </div>
      <div class="field">
        <svg viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9Zm-8-2a3 3 0 0 1 6 0v2H9Zm10 2h-2v2h2Z" /></svg>
        <input v-model="password" type="password" placeholder="密码" autocomplete="current-password" />
      </div>

      <div class="row">
        <label><input type="checkbox" v-model="remember" /> 记住我</label>
        <a href="#">忘记密码？</a>
      </div>

      <button class="btn" type="button" :disabled="loading" @click="onLogin">
        {{ loading ? '登 录 中…' : '登 录' }}
      </button>
    </form>

    <div class="divider">其他方式登录</div>
    <div class="socials">
      <a href="#" title="微信">
        <svg viewBox="0 0 24 24"><path d="M9 4C5 4 2 6.6 2 9.8c0 1.8 1 3.4 2.6 4.5L4 16l2.3-1.2c.8.2 1.6.3 2.4.3h.6a5.3 5.3 0 0 1-.2-1.4C9.1 9.3 12.4 6.8 16.3 6.8h.5C16 5.5 12.9 4 9 4Zm-2.4 3.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4.8 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM22 14.4c0-2.6-2.6-4.7-5.8-4.7s-5.8 2.1-5.8 4.7 2.6 4.7 5.8 4.7c.7 0 1.3-.1 1.9-.3L20 20l-.5-1.6c1.5-.9 2.5-2.2 2.5-3.9Zm-7.7-1a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Zm3.8 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z" /></svg>
      </a>
      <a href="#" title="QQ">
        <svg viewBox="0 0 24 24"><path d="M12 3c3.3 0 5.5 2.8 5.5 6.4 0 1.6.7 2.5 1.3 3.8.6 1.3.6 2.3-.3 2.4-.8.1-1.5-1-2-2-.4 2.4-1.8 4-4.5 4-2.7 0-4.1-1.6-4.5-4-.5 1-1.2 2.1-2 2-.9-.1-.9-1.1-.3-2.4.6-1.3 1.3-2.2 1.3-3.8C6.5 5.8 8.7 3 12 3Z" /></svg>
      </a>
      <a href="#" title="游客">
        <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13.5a7.5 7.5 0 0 1-6-3c.2-2 4-3.1 6-3.1s5.8 1.1 6 3.1a7.5 7.5 0 0 1-6 3Z" /></svg>
      </a>
    </div>

    <div class="foot">还没有账号？<a href="#">立即注册</a></div>
  </div>
</template>
