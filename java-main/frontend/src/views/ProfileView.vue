<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, clearLogin } from '../utils/auth'

const router = useRouter()

// ===== 昵称修改 =====
const nickName = ref('')
const nickLoading = ref(false)
const nickHint = ref('')
const nickHintType = ref('info')

// ===== 密码修改 =====
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwdLoading = ref(false)
const pwdHint = ref('')
const pwdHintType = ref('info')

onMounted(async () => {
  try {
    const me = await api('/api/me')
    nickName.value = me.nickName || ''
  } catch (e) {
    nickHint.value = e.message || '加载失败'
    nickHintType.value = 'error'
  }
})

function setNickHint(text, type = 'info') {
  nickHint.value = text
  nickHintType.value = type
}

/** 修改昵称：PUT /api/profile */
async function onSaveNickName() {
  if (nickLoading.value) return
  const name = nickName.value.trim()
  if (!name) {
    setNickHint('昵称不能为空～', 'error')
    return
  }
  if (name.length > 20) {
    setNickHint('昵称最长 20 个字符', 'error')
    return
  }
  setNickHint('')
  nickLoading.value = true
  try {
    await api('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ nickName: name })
    })
    setNickHint('昵称修改成功 🏆', 'success')
  } catch (e) {
    setNickHint(e.message || '修改失败，请稍后再试', 'error')
  } finally {
    nickLoading.value = false
  }
}

function setPwdHint(text, type = 'info') {
  pwdHint.value = text
  pwdHintType.value = type
}

/** 修改密码：PUT /api/password，成功后强制回登录页重新登录 */
async function onChangePassword() {
  if (pwdLoading.value) return
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    setPwdHint('三个框都要填哦～', 'error')
    return
  }
  if (newPassword.value.length < 6) {
    setPwdHint('新密码至少 6 位', 'error')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    setPwdHint('两次输入的新密码不一致', 'error')
    return
  }
  if (newPassword.value === oldPassword.value) {
    setPwdHint('新密码不能和旧密码相同', 'error')
    return
  }
  setPwdHint('')
  pwdLoading.value = true
  try {
    await api('/api/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword: oldPassword.value, newPassword: newPassword.value })
    })
    setPwdHint('密码修改成功，即将返回登录页…', 'success')
    // 后端已注销所有 token，清掉本地登录态重新登录
    clearLogin()
    setTimeout(() => router.push({ name: 'login' }), 800)
  } catch (e) {
    setPwdHint(e.message || '修改失败，请稍后再试', 'error')
  } finally {
    pwdLoading.value = false
  }
}

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="auth-card wide">
    <div class="topbar">
      <a href="#/home" @click.prevent="goHome">← 返回主页</a>
      <span style="color: var(--muted)">GOLDEN SPATULA</span>
    </div>

    <div class="logo">
      <h1 style="font-size: 22px">个人中心</h1>
      <p>PERSONAL CENTER</p>
    </div>

    <!-- ===== 修改昵称 ===== -->
    <div class="section-title">修改昵称</div>
    <form @submit.prevent="onSaveNickName">
      <div class="field plain">
        <label>新昵称 <span class="required">必填</span></label>
        <input v-model="nickName" type="text" maxlength="20" placeholder="给自己起个响亮的名字" />
      </div>
      <button class="btn" type="submit" :disabled="nickLoading">
        {{ nickLoading ? '保存中…' : '保存昵称' }}
      </button>
      <p class="form-hint" :class="{ 'is-error': nickHintType === 'error', 'is-success': nickHintType === 'success' }">{{ nickHint }}</p>
    </form>

    <!-- ===== 修改密码 ===== -->
    <div class="section-title">修改密码</div>
    <form @submit.prevent="onChangePassword">
      <div class="field plain">
        <label>旧密码 <span class="required">必填</span></label>
        <input v-model="oldPassword" type="password" autocomplete="current-password" placeholder="当前使用的密码" />
      </div>
      <div class="field plain">
        <label>新密码 <span class="required">必填</span></label>
        <input v-model="newPassword" type="password" autocomplete="new-password" placeholder="至少 6 位" />
      </div>
      <div class="field plain">
        <label>确认新密码 <span class="required">必填</span></label>
        <input v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="再输入一次新密码" />
      </div>
      <button class="btn" type="submit" :disabled="pwdLoading">
        {{ pwdLoading ? '提交中…' : '修改密码' }}
      </button>
      <p class="form-hint" :class="{ 'is-error': pwdHintType === 'error', 'is-success': pwdHintType === 'success' }">{{ pwdHint }}</p>
    </form>

    <p class="foot">修改密码成功后需要重新登录</p>
  </div>
</template>
