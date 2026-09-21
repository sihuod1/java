<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import CaptchaImage from '../components/CaptchaImage.vue'

const router = useRouter()

// 后端注册接口地址（springBootTest 项目，dev 端口 8081）
// 如果后端端口/域名不同，改这里即可
const API_BASE = 'http://localhost:8081'

const username = ref('')
const password = ref('')
const confirmPwd = ref('')
const captchaInput = ref('')

const captchaRef = ref(null)
const submitting = ref(false)
const hint = ref('')
const hintType = ref('info') // info | error | success

// 验证码是否已填写（用于按钮文案提示）
const captchaFilled = computed(() => captchaInput.value.trim().length > 0)

function setHint(text, type = 'info') {
  hint.value = text
  hintType.value = type
}

/** 换一张验证码 */
function refreshCaptcha() {
  captchaRef.value?.refresh()
}

function goLogin() {
  router.push({ name: 'login' })
}

/**
 * 提交注册
 * 校验顺序：账号 → 密码 → 确认密码 → 验证码，验证码必须正确才能注册成功
 */
async function onRegister() {
  if (submitting.value) return

  const user = username.value.trim()
  const code = captchaInput.value.trim()

  if (!user || !password.value || !confirmPwd.value) {
    setHint('账号、密码、确认密码都要填完整哦～', 'error')
    return
  }
  if (user.length < 4) {
    setHint('账号至少 4 位，方便别人记住你～', 'error')
    return
  }
  if (password.value.length < 6) {
    setHint('密码至少 6 位，肥嘟嘟帮你守门～', 'error')
    return
  }
  if (password.value !== confirmPwd.value) {
    setHint('两次密码不一致，检查一下嘛～', 'error')
    return
  }

  // ---- 验证码校验（注册的必经关卡）----
  if (!code) {
    refreshCaptcha()
    setHint('必须填写验证码才能注册，看不清可以点图片换一张', 'error')
    return
  }
  if (!captchaRef.value?.validate(code)) {
    captchaInput.value = ''
    refreshCaptcha()
    setHint('验证码不对，已经帮你换了一张，再试一次～', 'error')
    return
  }

  // 验证码通过，开始把注册信息提交到后端
  submitting.value = true
  setHint('验证码校验通过，正在创建账号…', 'info')

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: password.value })
    })
    const result = await res.json().catch(() => ({}))

    // 后端返回 { code: 0, message, data } 表示成功
    if (res.ok && result.code === 0) {
      setHint(`注册成功！召唤师「${user}」，正在返回登录页…`, 'success')
      setTimeout(() => {
        router.push({ name: 'login', query: { registered: user } })
      }, 1100)
      return
    }

    // 后端返回错误（如 409 用户名已存在、400 参数不合法）
    const msg = result.message || '注册失败，请稍后再试'
    if (res.status === 409) {
      // 用户名被占用：清空验证码并换一张，引导重试
      captchaInput.value = ''
      refreshCaptcha()
    }
    setHint(msg, 'error')
  } catch (e) {
    setHint('网络异常，连不上服务器，请确认后端已启动（localhost:8081）', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="card">
    <div class="logo">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="gReg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff4cf" />
            <stop offset="0.55" stop-color="#e0a93b" />
            <stop offset="1" stop-color="#b87a1e" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="36" height="26" rx="8" fill="url(#gReg)" stroke="#7a4f12" stroke-width="1.5" />
        <rect x="20" y="13" width="24" height="16" rx="5" fill="#fff4cf" opacity="0.55" />
        <rect x="29" y="32" width="6" height="22" rx="3" fill="url(#gReg)" stroke="#7a4f12" stroke-width="1.2" />
        <circle cx="32" cy="56" r="5" fill="url(#gReg)" stroke="#7a4f12" stroke-width="1.2" />
      </svg>
      <h1>创建账号</h1>
      <p>REGISTER · 注册新召唤师</p>
    </div>

    <form class="register-form" @submit.prevent="onRegister">
      <div class="field plain">
        <label for="regUser">召唤师账号</label>
        <input
          id="regUser"
          v-model="username"
          type="text"
          placeholder="设置你的账号（至少 4 位）"
          autocomplete="username"
        />
      </div>

      <div class="field plain">
        <label for="regPwd">密码</label>
        <input
          id="regPwd"
          v-model="password"
          type="password"
          placeholder="至少 6 位"
          autocomplete="new-password"
        />
      </div>

      <div class="field plain">
        <label for="regPwd2">确认密码</label>
        <input
          id="regPwd2"
          v-model="confirmPwd"
          type="password"
          placeholder="再输入一次密码"
          autocomplete="new-password"
        />
      </div>

      <!-- 验证码：注册必填 -->
      <div class="field plain">
        <label for="captcha">
          验证码
          <span class="required">必填</span>
        </label>
        <div class="captcha-row">
          <input
            id="captcha"
            v-model="captchaInput"
            type="text"
            maxlength="4"
            placeholder="输入右侧 4 位验证码"
            autocomplete="off"
            spellcheck="false"
          />
          <CaptchaImage ref="captchaRef" />
        </div>
        <p class="captcha-tip">
          <span>看不清？点击图片换一张</span>
          <a href="#" @click.prevent="refreshCaptcha">换一张</a>
        </p>
      </div>

      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? '注 册 中…' : '注 册' }}
      </button>

      <p
        class="form-hint"
        :class="{
          'is-error': hintType === 'error',
          'is-success': hintType === 'success'
        }"
      >
        {{ hint || (captchaFilled ? '' : '提示：注册必须通过验证码校验') }}
      </p>

      <div class="foot">
        已有账号？
        <a href="#/login" @click.prevent="goLogin">返回登录</a>
      </div>
    </form>
  </div>
</template>
