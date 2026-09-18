<script setup>
import { ref } from 'vue'
import '../styles/login.css'

const username = ref('')
const password = ref('')
const hint = ref('你的胆子肥嘟嘟，别怕输错～')

function onLogin() {
  if (!username.value.trim() || !password.value) {
    hint.value = '账号密码都填一下嘛，你的胆子肥嘟嘟也在等你～'
    return
  }
  hint.value = '登录成功！肥嘟嘟举铲冲鸭 🏆'
  burst()
}

// 登录成功彩带
function burst() {
  const colors = ['#f4c430', '#ff9aa0', '#8fd3ff', '#b6f0a0', '#ffd84d']
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div')
    c.className = 'confetti'
    c.style.left = Math.random() * 100 + 'vw'
    c.style.background = colors[i % colors.length]
    c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'
    document.body.appendChild(c)
    const dur = 1200 + Math.random() * 1200
    c.animate(
      [{ top: '-10px', opacity: 1 }, { top: '100vh', opacity: 0.8 }],
      { duration: dur, easing: 'cubic-bezier(.3,.7,.4,1)' }
    ).onfinish = () => c.remove()
  }
}
</script>

<template>
  <div class="card">
    <div class="topbar"></div>

    <!-- 胆子肥嘟嘟：使用上传的图片 -->
    <div class="mascot-wrap">
      <img class="mascot" src="/mascot.jpg" alt="你的胆子肥嘟嘟" />
    </div>

    <h1>金铲铲之战</h1>
    <p class="subtitle">你的胆子肥嘟嘟 · 登录就开战</p>

    <form @submit.prevent="onLogin">
      <div class="field">
        <label for="user">召唤师账号</label>
        <input id="user" v-model="username" type="text" placeholder="请输入账号" autocomplete="username" />
      </div>
      <div class="field">
        <label for="pwd">密码</label>
        <input id="pwd" v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
      </div>
      <button class="login-btn" type="submit">登 录</button>
      <p class="hint">{{ hint }}</p>
    </form>

    <p class="foot"><a href="#">忘记密码？</a> · <a href="#">注册新账号</a></p>
  </div>
</template>
