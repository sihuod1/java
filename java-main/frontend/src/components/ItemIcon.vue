<script setup>
import ItemShape from './ItemShape.vue'

// 装备图标：
// - 基础散件：单独图形
// - 合成装备：六边形底 + 「散件A + 散件B」的配方，一眼看出由什么合成
const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: '基础' },
  recipe: { type: Array, default: () => [] },
  size: { type: Number, default: 34 }
})
</script>

<template>
  <svg
    class="item-icon"
    :class="{ merged: type === '合成' }"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <!-- 合成装备：六边形底座 -->
    <template v-if="type === '合成' && recipe.length === 2">
      <path class="hex" d="M16 2.5l11.7 6.8v13.4L16 29.5 4.3 22.7V9.3L16 2.5z" />
      <g class="piece" transform="translate(2, 9.6) scale(0.4)">
        <ItemShape :name="recipe[0]" />
      </g>
      <g class="piece" transform="translate(17.2, 9.6) scale(0.4)">
        <ItemShape :name="recipe[1]" />
      </g>
      <path class="plus" d="M16 13.3v5.4M13.3 16h5.4" />
    </template>

    <!-- 基础散件 -->
    <ItemShape v-else :name="name" />
  </svg>
</template>

<style scoped>
.item-icon {
  display: block;
  flex: 0 0 auto;
  color: var(--gold-2);
  filter: drop-shadow(0 3px 8px rgba(247, 215, 116, 0.28));
}

.item-icon.merged {
  color: var(--gold-1);
}

.hex {
  fill: rgba(247, 215, 116, 0.08);
  stroke: currentColor;
  stroke-width: 1.4;
  opacity: 0.9;
}

.piece {
  color: var(--gold-2);
}

.plus {
  stroke: var(--gold-1);
  stroke-width: 1.7;
  stroke-linecap: round;
  fill: none;
}
</style>
