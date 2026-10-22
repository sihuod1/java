<script setup>
// 羁绊图标（32x32，线条 + 填充风格）
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 34 }
})
</script>

<template>
  <svg class="trait-icon" :width="size" :height="size" viewBox="0 0 32 32" aria-hidden="true">
    <!-- 骑士 · 盾牌 -->
    <g v-if="name === 'shield'">
      <path d="M16 3l11 4v8c0 7-4.8 10.6-11 13C9.8 25.6 5 22 5 15V7l11-4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M16 10l-3.6 4.4L16 19l3.6-4.6L16 10z" fill="currentColor" />
    </g>

    <!-- 游侠 · 靶心 -->
    <g v-else-if="name === 'bow'">
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" stroke-width="2.2" />
      <path d="M16 5.5v21M5.5 16h21" stroke="currentColor" stroke-width="1.3" opacity=".55" />
      <circle cx="16" cy="16" r="3.8" fill="currentColor" />
    </g>

    <!-- 剑士 · 交叉双剑 -->
    <g v-else-if="name === 'sword'">
      <g stroke="currentColor" stroke-width="2.3" stroke-linecap="round" fill="none">
        <path d="M8.5 23.5L23.5 8.5" />
        <path d="M23.5 23.5L8.5 8.5" />
        <path d="M6.6 10.4l3.8 3.8M25.4 10.4l-3.8 3.8" />
      </g>
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
    </g>

    <!-- 刺客 · 匕首 -->
    <g v-else-if="name === 'dagger'">
      <path d="M22.5 4.5l5.2 5.2-9.6 9.6-5.2-5.2 9.6-9.6z" fill="currentColor" />
      <path d="M4.5 21.5l5.8 5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <path d="M8.5 17.5l5.8 5.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
    </g>

    <!-- 法师 · 法球 -->
    <g v-else-if="name === 'orb'">
      <path d="M16 2.5v4.5M16 25v4.5M2.5 16H7M25 16h4.5M6.4 6.4l3.2 3.2M22.4 22.4l3.2 3.2M25.6 6.4l-3.2 3.2M9.6 22.4l-3.2 3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" />
      <circle cx="16" cy="16" r="6.6" fill="currentColor" />
      <circle cx="13.8" cy="13.8" r="2" fill="#fff" opacity=".5" />
    </g>

    <!-- 秘术师 · 之眼 -->
    <g v-else-if="name === 'eye'">
      <path d="M3.5 16S8.5 8 16 8s12.5 8 12.5 8-5 8-12.5 8S3.5 16 3.5 16z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
      <circle cx="16" cy="16" r="3.8" fill="currentColor" />
    </g>

    <!-- 守护神 · 堡垒 -->
    <g v-else-if="name === 'fortress'">
      <path d="M4 27.5V11l6-4 6 4 6-4 6 4v16.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M9 27.5v-8.5h5v8.5M18 27.5v-8.5h5v8.5" fill="currentColor" />
    </g>

    <!-- 冰川 · 雪花 -->
    <g v-else-if="name === 'snow'">
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none">
        <path d="M16 3v26M5.2 10l21.6 12M26.8 10L5.2 22" />
        <path d="M16 8l3.2-3.2M16 8L12.8 4.8M16 24l3.2 3.2M16 24l-3.2 3.2" stroke-width="1.6" />
      </g>
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
    </g>

    <!-- 暗影 · 月牙 -->
    <g v-else-if="name === 'moon'">
      <path d="M20.5 3.2a13.2 13.2 0 100 25.6 11 11 0 010-25.6z" fill="currentColor" />
      <circle cx="26" cy="7.5" r="1.5" fill="currentColor" opacity=".75" />
    </g>

    <!-- 虚空 · 裂缝 -->
    <g v-else-if="name === 'rift'">
      <path d="M16 3c-2.2 6.4-6.4 7.4-6.4 13S13.8 26 16 29c2.2-3 6.4-7 6.4-13S18.2 9.4 16 3z" fill="currentColor" />
      <circle cx="16" cy="16.5" r="3" fill="#fff" opacity=".35" />
    </g>

    <!-- 忍者 · 手里剑 -->
    <g v-else-if="name === 'shuriken'">
      <path d="M16 3.5l3.4 9.1L28.5 16l-9.1 3.4L16 28.5l-3.4-9.1L3.5 16l9.1-3.4L16 3.5z" fill="currentColor" />
      <circle cx="16" cy="16" r="2.8" fill="#0b1026" opacity=".5" />
    </g>

    <!-- 森林 · 树叶 -->
    <g v-else-if="name === 'leaf'">
      <path d="M16 28.5C8.6 26.2 4.6 19 6 7.6c11.4-1.4 18.6 4.2 20.6 12.4-3.2 5.4-6.6 7.3-10.6 8.5z" fill="currentColor" />
      <path d="M5.5 28.5L26.5 7.5" stroke="#fff" opacity=".3" stroke-width="1.6" />
    </g>

    <!-- 战士 · 战斧 -->
    <g v-else-if="name === 'axe'">
      <path d="M8.5 27.5l5.5-5.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none" />
      <path d="M13.5 21l6.5-6.5c3.2-3.2 7.4-3 9.2-1.2s2 6-1.2 9.2L21.5 29 13.5 21z" fill="currentColor" />
      <path d="M18.5 16.5l6.5 6.5" stroke="#fff" opacity=".22" stroke-width="1.6" fill="none" />
    </g>

    <!-- 枪手 · 双枪 -->
    <g v-else-if="name === 'gun'">
      <rect x="3.5" y="14.6" width="16" height="3.8" rx="1.4" fill="currentColor" />
      <path d="M19.5 12.4h3.6v6.6a3 3 0 01-3 3h-2l2.4-5.4v-4.2z" fill="currentColor" />
      <rect x="12.4" y="18.4" width="4" height="6.6" rx="1.3" fill="currentColor" />
      <path d="M26.5 9.5L30 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" />
    </g>

    <!-- 海盗 · 锚 -->
    <g v-else-if="name === 'anchor'">
      <circle cx="16" cy="6.4" r="2.6" fill="none" stroke="currentColor" stroke-width="2.2" />
      <path d="M16 9.4V27" stroke="currentColor" stroke-width="2.2" />
      <path d="M10.5 14h11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      <path d="M7 20.5c0 5.6 4 9.5 9 9.5s9-3.9 9-9.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
    </g>

    <!-- 雷霆 · 闪电 -->
    <g v-else-if="name === 'bolt'">
      <path d="M18.5 3L7 18.5h6.5l-2.5 11L24 14h-7l3.5-11z" fill="currentColor" />
      <path d="M14.5 10.5l-4 6" stroke="#fff" opacity=".3" stroke-width="1.5" fill="none" />
    </g>

    <!-- 斗士 · 生命 -->
    <g v-else-if="name === 'heart'">
      <path d="M16 27.5C8.2 21.6 4.5 17.4 4.5 13.2A6.7 6.7 0 0116 9.4a6.7 6.7 0 0111.5 3.8c0 4.2-3.7 8.4-11.5 14.3z" fill="currentColor" />
      <path d="M11.5 12.5a3 3 0 015-2" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45" stroke-linecap="round" />
    </g>

    <!-- 月神 · 星辰 -->
    <g v-else-if="name === 'stars'">
      <path d="M18 3.5l2.4 6.1 6.6 2.4-6.6 2.4L18 20.5l-2.4-6.1L9 12l6.6-2.4L18 3.5z" fill="currentColor" />
      <circle cx="7.5" cy="24.5" r="2.4" fill="currentColor" opacity=".85" />
      <circle cx="24.5" cy="25.5" r="1.8" fill="currentColor" opacity=".6" />
    </g>

    <!-- 浪人 · 疾风 -->
    <g v-else-if="name === 'wave'">
      <path d="M5 19.5c3.6 0 3.6-4.2 7.2-4.2s3.6 4.2 7.2 4.2 3.6-4.2 7.2-4.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <path d="M5 26c3.6 0 3.6-4.2 7.2-4.2s3.6 4.2 7.2 4.2 3.6-4.2 7.2-4.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <path d="M8 7.5c3 0 3 3.5 6 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55" />
    </g>

    <!-- 神射手 · 瞄准 -->
    <g v-else-if="name === 'crosshair'">
      <circle cx="16" cy="16" r="9.6" fill="none" stroke="currentColor" stroke-width="2.2" />
      <path d="M16 2.6v6.4M16 23v6.4M2.6 16H9M23 16h6.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <path d="M16 10.5l-4 6.5h8l-4-6.5z" fill="currentColor" />
    </g>

    <!-- 狂战士 · 怒气 -->
    <g v-else-if="name === 'rage'">
      <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M16 26.5V8.5" />
        <path d="M9 15.5l7-7 7 7" />
      </g>
      <path d="M6 29h20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none" />
    </g>

    <!-- 战地机甲 · 齿轮 -->
    <g v-else-if="name === 'gear'">
      <circle cx="16" cy="16" r="6.2" fill="none" stroke="currentColor" stroke-width="2.4" />
      <path d="M16 3.6v5.2M16 23.2v5.2M3.6 16h5.2M23.2 16h5.2M7.2 7.2l3.7 3.7M21.1 21.1l3.7 3.7M24.8 7.2l-3.7 3.7M10.9 21.1l-3.7 3.7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" fill="none" />
    </g>

    <!-- 神龙尊者 · 龙卷 -->
    <g v-else-if="name === 'cyclone'">
      <path d="M9 8.5c5-2.6 11-2.6 16 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <path d="M6 16c6.5-3.4 14.5-3.4 21 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <path d="M9 23.5c5-2.6 11-2.6 16 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
    </g>

    <!-- 灵魂莲华 · 莲花 -->
    <g v-else-if="name === 'lotus'">
      <path d="M8.8 18.4c-2.6-2-3.6-5.2-2-7.4 2.6.2 4.2 2.2 4.6 4.8M23.2 18.4c2.6-2 3.6-5.2 2-7.4-2.6.2-4.2 2.2-4.6 4.8" fill="currentColor" opacity=".8" />
      <path d="M16 28c-4.6-3-7.2-6-7.2-9.6a7.2 7.2 0 0114.4 0C23.2 22 20.6 25 16 28z" fill="currentColor" />
      <path d="M16 25.5v-6" stroke="#fff" opacity=".35" stroke-width="1.5" fill="none" />
    </g>

    <!-- 兜底 -->
    <g v-else>
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" stroke-width="2.2" />
      <circle cx="16" cy="16" r="3.8" fill="currentColor" />
    </g>
  </svg>
</template>

<style scoped>
.trait-icon {
  display: block;
  flex: 0 0 auto;
  color: var(--gold-2);
  filter: drop-shadow(0 3px 8px rgba(247, 215, 116, 0.25));
}
</style>
