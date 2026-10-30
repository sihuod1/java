<script setup>
import { computed } from 'vue'
import { itemPhoto } from '../data/itemImages'
import ItemShape from './ItemShape.vue'

// 装备图标：
// - 优先显示金铲铲官方真实图标（assets/items/，按名字匹配）
// - 没有对应图片的装备回退为 SVG 图形（基础散件单独图形 / 合成装备六边形底 + 配方）
const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: '基础' },
  recipe: { type: Array, default: () => [] },
  size: { type: Number, default: 34 }
})

const photo = computed(() => itemPhoto(props.name))
</script>

<template>
  <!-- 金铲铲官方真实图标 -->
  <img
    v-if="photo"
    class="item-photo"
    :class="{ merged: type === '合成' }"
    :src="photo"
    :alt="name"
    :width="size"
    :height="size"
    loading="lazy"
    draggable="false"
  />

  <!-- SVG 回退 -->
  <svg
    v-else
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
.item-photo {
  display: block;
  flex: 0 0 auto;
  object-fit: contain;
  border-radius: 6px;
  filter: drop-shadow(0 3px 8px rgba(247, 215, 116, 0.28));
}

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
