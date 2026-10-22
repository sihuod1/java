<script setup>
import { useRouter } from 'vue-router'
import { isLoggedIn, getSavedUser } from '../utils/auth'

const router = useRouter()

const logged = isLoggedIn()
const user = getSavedUser()
const displayName = user.nickName || user.username || '召唤师'

function goLogin() {
  router.push({ name: 'login' })
}
function goRegister() {
  router.push({ name: 'register' })
}
function goHome() {
  router.push({ name: 'home' })
}

/* ================= 棋盘数据 =================
 * TFT 标准棋盘一格是正六边形，这里画 4 行 × 8 列：
 * 上两行是敌方半场（暗色），下两行是我方半场（亮色）。
 * cost = 棋子费用（1~5），决定边框与发光颜色，和游戏内一致。
 */
const COLS = 8
const ROWS = 4

const COST_COLOR = {
  1: '#8f9bb3',
  2: '#2fae5f',
  3: '#3b8bf5',
  4: '#b45cf0',
  5: '#f5b942'
}

// 全局格子序号 -> 棋子（键为 r * COLS + c）
const UNIT_MAP = {
  2: { name: '奥恩', cost: 1, side: 'enemy' },
  5: { name: '韦鲁斯', cost: 2, side: 'enemy' },
  10: { name: '布隆', cost: 3, side: 'enemy' },
  13: { name: '千珏', cost: 4, side: 'enemy' },
  17: { name: '盖伦', cost: 1, side: 'ally' },
  19: { name: '艾希', cost: 2, side: 'ally' },
  21: { name: '锐雯', cost: 3, side: 'ally' },
  25: { name: '亚索', cost: 4, side: 'ally' },
  27: { name: '阿卡丽', cost: 5, side: 'ally' }
}

const board = []
for (let r = 0; r < ROWS; r++) {
  const cells = []
  for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c
    const unit = UNIT_MAP[i] || null
    cells.push({ i, unit, delay: ((r + c) % 6) * 0.28 })
  }
  board.push(cells)
}

// 当前阵容激活的羁绊
const activeTraits = [
  { name: '骑士', count: 2, color: '#e0a93b' },
  { name: '游侠', count: 2, color: '#3b8bf5' },
  { name: '剑士', count: 2, color: '#ff7a7a' },
  { name: '刺客', count: 1, color: '#b45cf0' }
]

/* ================= 核心玩法 ================= */
const mechanics = [
  {
    key: 'trait',
    title: '羁绊搭配',
    desc: '上阵同羁绊英雄触发加成，凑齐人数即可质变阵容，一套羁绊就是一套打法。',
    tip: '30+ 种羁绊'
  },
  {
    key: 'item',
    title: '装备合成',
    desc: '九件散件两两合成神装，金铲铲还能改写英雄羁绊，一把装备定胜负。',
    tip: '100+ 种合成'
  },
  {
    key: 'econ',
    title: '运营节奏',
    desc: '利息、连胜连败、D 牌时机都要算，谁的经济滚起来，谁就能笑到最后。',
    tip: '8 人同局博弈'
  }
]

/* ================= 段位天梯 ================= */
const ranks = [
  { name: '坚韧黑铁', color: '#5a5a66' },
  { name: '英勇黄铜', color: '#9c6431' },
  { name: '不屈白银', color: '#a2aebd' },
  { name: '荣耀黄金', color: '#e0a93b' },
  { name: '华贵铂金', color: '#57cdbf' },
  { name: '流光翡翠', color: '#37bd7c' },
  { name: '璀璨钻石', color: '#7aa8ff' },
  { name: '最强王者', color: '#f7d774' }
]

/* ================= 数据面板 ================= */
const stats = [
  { value: '8', label: '人同局对战' },
  { value: '60+', label: '英雄棋子' },
  { value: '30+', label: '羁绊组合' },
  { value: '9', label: '件基础散件' }
]
</script>

<template>
  <div class="landing">
    <!-- ===== 顶部导航 ===== -->
    <header class="nav">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#fff4cf" />
              <stop offset="0.55" stop-color="#e0a93b" />
              <stop offset="1" stop-color="#b87a1e" />
            </linearGradient>
          </defs>
          <rect x="14" y="6" width="36" height="26" rx="8" fill="url(#goldGrad)" stroke="#7a4f12" stroke-width="2" />
          <rect x="20" y="11" width="24" height="16" rx="5" fill="#fff4cf" opacity="0.5" />
          <rect x="29" y="30" width="6" height="24" rx="3" fill="url(#goldGrad)" stroke="#7a4f12" stroke-width="1.6" />
          <circle cx="32" cy="56" r="5" fill="url(#goldGrad)" stroke="#7a4f12" stroke-width="1.6" />
        </svg>
        <span class="brand-text">金铲铲之战</span>
      </div>

      <nav class="nav-links">
        <template v-if="logged">
          <span class="hello">召唤师 <b>{{ displayName }}</b>，欢迎回来</span>
          <button class="btn-gold" @click="goHome">进入战场</button>
        </template>
        <template v-else>
          <a href="#/login" @click.prevent="goLogin">登录</a>
          <button class="btn-gold" @click="goRegister">免费注册</button>
        </template>
      </nav>
    </header>

    <!-- ===== 主视觉：左文案 + 右棋盘 ===== -->
    <section class="hero">
      <div class="hero-copy">
        <span class="season-badge">
          <i class="dot"></i>巨龙之境 · 第 15 赛季开启
        </span>
        <h1 class="hero-title">金铲铲之战</h1>
        <p class="hero-en">GOLDEN SPATULA · AUTO BATTLE</p>
        <p class="hero-desc">
          八人同局，各自为战。<br />
          排兵布阵、合成神装、滚起经济——<br />
          用最后站着的阵容，抢下那把金色铲铲。
        </p>

        <div class="hero-actions">
          <template v-if="logged">
            <button class="btn-primary" @click="goHome">进入战场</button>
            <button class="btn-ghost" @click="goHome">查看我的战绩</button>
          </template>
          <template v-else>
            <button class="btn-primary" @click="goRegister">立即开黑</button>
            <button class="btn-ghost" @click="goLogin">已有账号，登录</button>
          </template>
        </div>

        <ul class="stats">
          <li v-for="s in stats" :key="s.label">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </li>
        </ul>
      </div>

      <!-- 六边形棋盘 -->
      <div class="board-panel">
        <div class="board-head">
          <span class="board-title">对局进行中</span>
          <span class="board-round">阶段 3-2</span>
        </div>

        <div class="board">
          <div v-for="(row, r) in board" :key="r" class="board-row" :class="{ offset: r % 2 === 1 }">
            <div
              v-for="cell in row"
              :key="cell.i"
              class="hex"
              :class="{ 'is-ally': r >= 2 }"
              :style="{ '--delay': cell.delay + 's' }"
            >
              <span class="hex-bg"></span>
              <div
                v-if="cell.unit"
                class="unit"
                :class="cell.unit.side"
                :style="{ '--c': COST_COLOR[cell.unit.cost] }"
                :title="cell.unit.name + ' · ' + cell.unit.cost + ' 费'"
              >
                <span class="unit-name">{{ cell.unit.name }}</span>
                <span class="unit-cost">{{ cell.unit.cost }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="traits">
          <span v-for="t in activeTraits" :key="t.name" class="trait" :style="{ '--t': t.color }">
            {{ t.name }} <b>{{ t.count }}</b>
          </span>
        </div>
      </div>
    </section>

    <!-- ===== 核心玩法 ===== -->
    <section class="section">
      <h2 class="section-title">三步决定胜负</h2>
      <p class="section-sub">从选秀到成型，每一局都是全新的博弈</p>
      <div class="cards">
        <article v-for="m in mechanics" :key="m.key" class="card">
          <div class="card-icon">
            <!-- 羁绊 -->
            <svg v-if="m.key === 'trait'" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="17" r="7" stroke="currentColor" stroke-width="2.4" />
              <circle cx="32" cy="17" r="7" stroke="currentColor" stroke-width="2.4" />
              <circle cx="24" cy="33" r="7" stroke="currentColor" stroke-width="2.4" />
              <path d="M21 22l6-3M27 22l-6-3M22 28l-4-4M26 28l4-4" stroke="currentColor" stroke-width="2" opacity=".75" />
            </svg>
            <!-- 金铲铲 -->
            <svg v-else-if="m.key === 'item'" viewBox="0 0 48 48" fill="none">
              <rect x="11" y="8" width="26" height="19" rx="6" stroke="currentColor" stroke-width="2.4" />
              <path d="M20 27h8v10a4 4 0 01-8 0V27z" stroke="currentColor" stroke-width="2.4" />
              <path d="M17 14h14M17 20h14" stroke="currentColor" stroke-width="2" opacity=".7" />
            </svg>
            <!-- 金币 -->
            <svg v-else viewBox="0 0 48 48" fill="none">
              <ellipse cx="24" cy="14" rx="13" ry="6" stroke="currentColor" stroke-width="2.4" />
              <path d="M11 14v10c0 3.3 5.8 6 13 6s13-2.7 13-6V14" stroke="currentColor" stroke-width="2.4" />
              <path d="M11 24v10c0 3.3 5.8 6 13 6s13-2.7 13-6V24" stroke="currentColor" stroke-width="2.4" />
            </svg>
          </div>
          <h3>{{ m.title }}</h3>
          <p>{{ m.desc }}</p>
          <span class="card-tip">{{ m.tip }}</span>
        </article>
      </div>
    </section>

    <!-- ===== 段位天梯 ===== -->
    <section class="section">
      <h2 class="section-title">段位天梯</h2>
      <p class="section-sub">从坚韧黑铁一路打到最强王者</p>
      <div class="ladder">
        <div v-for="(rk, i) in ranks" :key="rk.name" class="rank" :style="{ '--r': rk.color, '--i': i }">
          <span class="rank-bar"></span>
          <span class="rank-name">{{ rk.name }}</span>
        </div>
      </div>
    </section>

    <!-- ===== 底部 CTA ===== -->
    <section class="cta">
      <h2>棋盘已铺好，就等你落子</h2>
      <p>注册即送新手礼包，召唤师，加入战局吧。</p>
      <button class="btn-primary big" @click="logged ? goHome() : goRegister()">
        {{ logged ? '进入战场' : '免费注册，立即开黑' }}
      </button>
    </section>

    <footer class="footer">© 2026 金铲铲之战 · 学习演示项目（Vue3 + SpringBoot3）</footer>
  </div>
</template>

<style scoped>
/* ============ 布局容器 ============ */
.landing {
  width: min(1180px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 26px;
  z-index: 2;
}

/* ============ 顶部导航 ============ */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-radius: 18px;
  border: 1px solid rgba(247, 215, 116, 0.22);
  background: rgba(16, 19, 42, 0.72);
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 4px 10px var(--gold-glow));
}

.brand-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--gold-1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 14px;
}

.nav-links a {
  color: var(--ink);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--gold-1);
}

.hello {
  color: var(--muted);
}

.hello b {
  color: var(--gold-1);
}

/* ============ 通用按钮 ============ */
.btn-gold,
.btn-primary {
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #3a2a06;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 55%, var(--gold-3));
  box-shadow: 0 6px 18px rgba(247, 215, 116, 0.3);
  transition: filter 0.2s, transform 0.12s, box-shadow 0.2s;
}

.btn-gold {
  padding: 9px 20px;
  font-size: 14px;
}

.btn-primary {
  padding: 15px 42px;
  font-size: 16px;
  letter-spacing: 2px;
}

.btn-primary.big {
  padding: 18px 54px;
  font-size: 17px;
}

.btn-gold:hover,
.btn-primary:hover {
  filter: brightness(1.08);
  box-shadow: 0 10px 30px rgba(247, 215, 116, 0.45);
}

.btn-gold:active,
.btn-primary:active {
  transform: translateY(1px);
}

.btn-ghost {
  padding: 15px 34px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  color: var(--gold-1);
  background: transparent;
  border: 1px solid rgba(247, 215, 116, 0.45);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.btn-ghost:hover {
  border-color: var(--gold-1);
  box-shadow: 0 6px 22px rgba(247, 215, 116, 0.18);
}

/* ============ 主视觉 ============ */
.hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 40px;
  align-items: center;
  padding: 34px 0 10px;
}

.season-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--gold-1);
  border: 1px solid rgba(247, 215, 116, 0.35);
  background: rgba(247, 215, 116, 0.08);
}

.season-badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6ee7a8;
  box-shadow: 0 0 8px #6ee7a8;
  animation: blink 1.6s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.hero-title {
  margin-top: 18px;
  font-size: 60px;
  letter-spacing: 10px;
  background: linear-gradient(180deg, #fff4cf, var(--gold-2) 70%, var(--gold-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 4px 30px rgba(247, 215, 116, 0.25);
}

.hero-en {
  margin-top: 8px;
  font-size: 12px;
  letter-spacing: 5px;
  color: var(--muted);
}

.hero-desc {
  margin-top: 20px;
  font-size: 15px;
  line-height: 2;
  color: var(--ink);
  opacity: 0.92;
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.stats {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  list-style: none;
  border-top: 1px solid rgba(247, 215, 116, 0.16);
  padding-top: 20px;
}

.stats li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats strong {
  font-size: 24px;
  color: var(--gold-1);
}

.stats span {
  font-size: 12px;
  color: var(--muted);
}

/* ============ 棋盘 ============ */
.board-panel {
  padding: 20px 22px 22px;
  border-radius: 22px;
  border: 1px solid rgba(247, 215, 116, 0.24);
  background: linear-gradient(180deg, rgba(30, 34, 66, 0.9), rgba(14, 17, 38, 0.94));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 13px;
}

.board-title {
  color: var(--gold-1);
  letter-spacing: 2px;
  font-weight: 700;
}

.board-round {
  padding: 4px 12px;
  border-radius: 999px;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.board {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 6px;
}

.board-row {
  display: flex;
  gap: 6px;
}

.board-row.offset {
  margin-left: 30px; /* 半格，形成六边形错位咬合 */
}

.board-row + .board-row {
  margin-top: -15px;
}

.hex {
  position: relative;
  width: 54px;
  height: 62px;
  flex: 0 0 auto;
}

.hex-bg {
  position: absolute;
  inset: 0;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid transparent;
  animation: hex-breathe 5s ease-in-out infinite;
  animation-delay: var(--delay);
}

.hex.is-ally .hex-bg {
  background: rgba(247, 215, 116, 0.09);
}

@keyframes hex-breathe {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

.unit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.28), rgba(10, 12, 28, 0.92));
  border: 2px solid var(--c);
  box-shadow: 0 0 14px var(--c), inset 0 0 10px rgba(0, 0, 0, 0.55);
  animation: unit-in 0.5s ease backwards, unit-idle 3.2s ease-in-out infinite;
  animation-delay: var(--delay), calc(var(--delay) + 0.5s);
  z-index: 2;
}

.unit.enemy {
  filter: saturate(0.45) brightness(0.82);
  box-shadow: 0 0 10px rgba(255, 90, 90, 0.55), inset 0 0 10px rgba(0, 0, 0, 0.6);
}

.unit-name {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
}

.unit-cost {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: #12142c;
  background: var(--c);
  box-shadow: 0 0 6px var(--c);
}

@keyframes unit-in {
  from { opacity: 0; transform: translate(-50%, -30%) scale(0.4); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes unit-idle {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -54%); }
}

/* 羁绊徽章 */
.traits {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trait {
  padding: 5px 13px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--t);
  border: 1px solid var(--t);
  background: color-mix(in srgb, var(--t) 14%, transparent);
}

.trait b {
  font-size: 13px;
}

/* ============ 通用区块 ============ */
.section {
  padding: 14px 0 4px;
}

.section-title {
  text-align: center;
  font-size: 26px;
  letter-spacing: 4px;
  color: var(--gold-1);
}

.section-sub {
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  color: var(--muted);
}

/* ============ 玩法卡片 ============ */
.cards {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.card {
  padding: 28px 24px 24px;
  border-radius: 18px;
  border: 1px solid rgba(247, 215, 116, 0.2);
  background: linear-gradient(180deg, rgba(30, 34, 66, 0.85), rgba(16, 19, 42, 0.9));
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  border-color: rgba(247, 215, 116, 0.5);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.42), 0 0 30px rgba(247, 215, 116, 0.1);
}

.card-icon {
  width: 46px;
  height: 46px;
  color: var(--gold-2);
  margin-bottom: 14px;
}

.card-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 10px var(--gold-glow));
}

.card h3 {
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--gold-1);
  margin-bottom: 10px;
}

.card p {
  font-size: 13px;
  line-height: 1.9;
  color: var(--muted);
}

.card-tip {
  display: inline-block;
  margin-top: 14px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.1);
  border: 1px solid rgba(247, 215, 116, 0.28);
}

/* ============ 段位天梯 ============ */
.ladder {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}

.rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 6px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 24, 50, 0.7);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.rank:hover {
  transform: translateY(-4px);
  border-color: var(--r);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px color-mix(in srgb, var(--r) 35%, transparent);
}

.rank-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--r) 45%, transparent), var(--r));
  box-shadow: 0 0 12px color-mix(in srgb, var(--r) 60%, transparent);
}

.rank-name {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--r);
  text-align: center;
}

/* ============ 底部 CTA ============ */
.cta {
  margin-top: 10px;
  text-align: center;
  padding: 46px 24px;
  border-radius: 22px;
  border: 1px solid rgba(247, 215, 116, 0.26);
  background:
    radial-gradient(600px 200px at 50% 0%, rgba(247, 215, 116, 0.14), transparent 70%),
    linear-gradient(180deg, rgba(30, 34, 66, 0.9), rgba(14, 17, 38, 0.94));
}

.cta h2 {
  font-size: 28px;
  letter-spacing: 4px;
  color: var(--gold-1);
}

.cta p {
  margin-top: 12px;
  font-size: 14px;
  color: var(--muted);
}

.cta .btn-primary {
  margin-top: 26px;
}

.footer {
  text-align: center;
  padding: 12px 0 6px;
  font-size: 12px;
  color: #6f6c8c;
}

/* ============ 响应式 ============ */
@media (max-width: 1000px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .board-panel {
    max-width: 560px;
    width: 100%;
  }
  .ladder {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 720px) {
  .hero-title {
    font-size: 38px;
    letter-spacing: 5px;
  }
  .cards {
    grid-template-columns: 1fr;
  }
  .ladder {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .nav {
    flex-direction: column;
    gap: 12px;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .board-panel {
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .hex {
    width: 44px;
    height: 50px;
  }
  .board-row.offset {
    margin-left: 24px;
  }
  .board-row + .board-row {
    margin-top: -12px;
  }
  .unit {
    width: 32px;
    height: 32px;
  }
  .unit-name {
    font-size: 8px;
  }
}

/* 尊重系统的「减少动效」设置 */
@media (prefers-reduced-motion: reduce) {
  .hex-bg,
  .unit,
  .season-badge .dot {
    animation: none;
  }
}
</style>
