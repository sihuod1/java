<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  // 验证码位数
  length: { type: Number, default: 4 },
  width: { type: Number, default: 110 },
  height: { type: Number, default: 42 }
})

const emit = defineEmits(['change'])

const canvasRef = ref(null)
// 当前正确答案（只留在组件内部，不对外暴露到 DOM 上）
const answer = ref('')

// 字符集：去掉易混淆的 0/O/1/I/L
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randInt(n) {
  return Math.floor(Math.random() * n)
}

// 暗色卡片上用明亮偏金的随机色，保证可读性
function randomColor() {
  const r = 200 + randInt(56)
  const g = 150 + randInt(80)
  const b = 60 + randInt(100)
  return `rgb(${r},${g},${b})`
}

function draw(code) {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  const w = c.width
  const h = c.height
  ctx.clearRect(0, 0, w, h)

  // 半透明底
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(0, 0, w, h)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = randomColor()
    ctx.beginPath()
    ctx.moveTo(randInt(w), randInt(h))
    ctx.lineTo(randInt(w), randInt(h))
    ctx.stroke()
  }

  // 干扰点
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = randomColor()
    ctx.fillRect(randInt(w), randInt(h), 2, 2)
  }

  // 验证码文字（轻微旋转 + 错位）
  const step = (w - 24) / code.length
  for (let i = 0; i < code.length; i++) {
    ctx.save()
    ctx.fillStyle = randomColor()
    ctx.font = 'bold 26px "Courier New", monospace'
    ctx.translate(18 + i * step, h / 2 + 6)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.fillText(code[i], -8, 0)
    ctx.restore()
  }
}

/** 重新生成并绘制一张验证码 */
function refresh() {
  let code = ''
  for (let i = 0; i < props.length; i++) code += CHARS[randInt(CHARS.length)]
  answer.value = code
  draw(code)
  emit('change', code)
}

/** 校验用户输入是否与当前验证码一致（忽略大小写、忽略首尾空格） */
function validate(input) {
  return String(input ?? '').trim().toUpperCase() === answer.value.toUpperCase()
}

onMounted(refresh)

// 供父组件调用：refresh() / validate(input)
defineExpose({ refresh, validate })
</script>

<template>
  <canvas
    ref="canvasRef"
    class="captcha-canvas"
    :width="width"
    :height="height"
    title="看不清？点击换一张"
    role="img"
    aria-label="图形验证码，点击可刷新"
    @click="refresh"
  ></canvas>
</template>
