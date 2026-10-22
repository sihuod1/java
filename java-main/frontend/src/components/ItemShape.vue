<script setup>
// 单个装备散件的 SVG 图形（32x32 坐标系）。
// 根元素是 <g> 而不是 <svg>，方便被 ItemIcon 嵌套缩放复用。
const props = defineProps({
  name: { type: String, required: true }
})
</script>

<template>
  <!-- 暴风大剑 -->
  <g v-if="name === '暴风大剑'">
    <path d="M16 3l3.2 4.2V17h-6.4V7.2L16 3z" fill="currentColor" />
    <path d="M14.2 5.2l1.8-2 1.8 2-1.8 2.4-1.8-2.4z" fill="#fff" opacity=".5" />
    <rect x="9.5" y="17" width="13" height="2.6" rx="1" fill="currentColor" />
    <rect x="14.6" y="19.6" width="2.8" height="6.4" fill="currentColor" />
    <circle cx="16" cy="27.6" r="1.9" fill="currentColor" />
  </g>

  <!-- 反曲之弓 -->
  <g v-else-if="name === '反曲之弓'">
    <path d="M12 4.5C5 10 5 22 12 27.5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <path d="M12 4.5v23" stroke="currentColor" stroke-width="1.3" opacity=".85" />
    <path d="M9.5 16h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    <path d="M24.5 16l-4.6-3.2M24.5 16l-4.6 3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" />
    <circle cx="24.5" cy="16" r="1.2" fill="currentColor" />
  </g>

  <!-- 无用大棒 -->
  <g v-else-if="name === '无用大棒'">
    <rect x="14.4" y="13.5" width="3.2" height="16" rx="1.2" fill="currentColor" />
    <circle cx="16" cy="8.6" r="5.4" fill="currentColor" />
    <circle cx="14.2" cy="7" r="1.8" fill="#fff" opacity=".55" />
    <path d="M13.5 19.5h5M13.5 23.5h5" stroke="#000" opacity=".16" stroke-width="1.2" />
  </g>

  <!-- 女神之泪 -->
  <g v-else-if="name === '女神之泪'">
    <path d="M16 3.5c4.4 6.2 7.2 9.9 7.2 13.6a7.2 7.2 0 01-14.4 0c0-3.7 2.8-7.4 7.2-13.6z" fill="currentColor" />
    <path d="M12.6 16.5a3.4 3.4 0 002.6 3.6" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round" />
  </g>

  <!-- 锁子甲 -->
  <g v-else-if="name === '锁子甲'">
    <path d="M16 3.5l11.5 4.2v8.8c0 7.4-5.2 11-11.5 13.5C9.7 27.5 4.5 23.9 4.5 16.5V7.7L16 3.5z" fill="currentColor" />
    <path d="M16 8v19" stroke="#000" opacity=".18" stroke-width="1.6" />
    <path d="M5 12.5h22" stroke="#000" opacity=".14" stroke-width="1.4" />
    <path d="M16 6l8 3v7.5c0 5.2-3.7 8-8 10.2V6z" fill="#fff" opacity=".12" />
  </g>

  <!-- 负极斗篷 -->
  <g v-else-if="name === '负极斗篷'">
    <path d="M16 3.5l9.5 3.4-2.6 21.6H9.1L6.5 6.9 16 3.5z" fill="currentColor" />
    <path d="M16 3.5l9.5 3.4-1.3 10.8L16 12.5V3.5z" fill="#fff" opacity=".14" />
    <path d="M12 26l1.2-9M20 26l-1.2-9" stroke="#000" opacity=".16" stroke-width="1.3" />
  </g>

  <!-- 巨人腰带 -->
  <g v-else-if="name === '巨人腰带'">
    <rect x="4" y="11" width="24" height="10" rx="2" fill="currentColor" />
    <rect x="12.5" y="8.8" width="7" height="14.4" rx="1.4" fill="none" stroke="#0b1026" stroke-width="1.6" />
    <rect x="14.2" y="13.2" width="3.6" height="5.6" rx="0.8" fill="#0b1026" opacity=".35" />
    <path d="M6 13h5M6 19h5M21 13h5M21 19h5" stroke="#000" opacity=".18" stroke-width="1.2" />
  </g>

  <!-- 拳套 -->
  <g v-else-if="name === '拳套'">
    <path d="M8.5 13.5c0-3.3 2.2-5.5 5.5-5.5h4.2c3.3 0 5.3 2.2 5.3 5.5v7.5a5.5 5.5 0 01-5.5 5.5h-4a5.5 5.5 0 01-5.5-5.5v-7.5z" fill="currentColor" />
    <path d="M11.5 13.5h9M11.5 17.5h9M11.5 21.5h6.5" stroke="#0b1026" stroke-width="1.3" opacity=".4" />
    <path d="M14 9.5h3.5v3H14z" fill="#fff" opacity=".25" />
  </g>

  <!-- 金铲铲 -->
  <g v-else-if="name === '金铲铲'">
    <path d="M9.5 3.5h13v9.6a4.8 4.8 0 01-4.8 4.8h-3.4a4.8 4.8 0 01-4.8-4.8V3.5z" fill="currentColor" />
    <path d="M11.5 6h9v3h-9z" fill="#fff" opacity=".35" />
    <rect x="14.6" y="17.9" width="2.8" height="11.6" rx="1.2" fill="currentColor" />
  </g>

  <!-- 兜底：未知装备 -->
  <g v-else>
    <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M16 11v10M11 16h10" stroke="currentColor" stroke-width="2" />
  </g>
</template>
