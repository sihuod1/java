<script setup>
import { onMounted, ref } from 'vue'

const starsRef = ref(null)

// 生成漂浮的金色光点
onMounted(() => {
  const container = starsRef.value
  if (!container) return
  const count = 40
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span')
    s.className = 'star'
    s.style.left = Math.random() * 100 + 'vw'
    s.style.top = Math.random() * 100 + 'vh'
    s.style.animationDelay = Math.random() * 9 + 's'
    s.style.animationDuration = 7 + Math.random() * 5 + 's'
    const scale = 0.5 + Math.random()
    s.style.width = s.style.height = 3 * scale + 'px'
    container.appendChild(s)
  }
})
</script>

<template>
  <div class="stars" ref="starsRef"></div>
  <!-- 登录 / 注册 由路由切换 -->
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
/* 页面切换时淡入上浮 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
