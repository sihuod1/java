<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CHAMPIONS, TRAITS, BASE_ITEMS, FULL_ITEMS, COST_COLOR, COST_LABEL
} from '../data/gameData'
import { Game, computeTraitBonuses } from '../data/gameEngine'

const router = useRouter()

const game = ref(null)
const started = ref(false)
const gameOver = ref(false)
const won = ref(false)
const logs = ref([])
const shop = ref([])
const selectedRuneOptions = ref([])

/* 响应式玩家状态快照 */
const player = reactive({
  hp: 100, gold: 10, level: 1, xp: 0,
  board: [], bench: [], runes: [], baseItems: [], winStreak: 0, loseStreak: 0
})

function syncPlayer() {
  const p = game.value.player
  player.hp = p.hp
  player.gold = p.gold
  player.level = p.level
  player.xp = p.xp
  player.board = p.board
  player.bench = p.bench
  player.runes = p.runes
  player.baseItems = p.baseItems
  player.winStreak = p.winStreak
  player.loseStreak = p.loseStreak
  shop.value = p.shop
  logs.value = [...game.value.logs]
}

function startGame() {
  game.value = new Game('召唤师')
  game.value.startRound()
  started.value = true
  gameOver.value = false
  won.value = false
  syncPlayer()
}

function buy(i) {
  if (game.value.buyChamp(i)) syncPlayer()
}

function sell(i) {
  game.value.sellBench(i)
  syncPlayer()
}

function refresh() {
  if (game.value.refreshShopPaid()) syncPlayer()
}

function levelUp() {
  if (game.value.levelUp()) syncPlayer()
}

/* 上阵：点备战席单位 → 放到 board 第一个空位 */
function deploy(benchIndex) {
  const p = game.value.player
  const emptyIdx = p.board.findIndex(u => u == null)
  const target = emptyIdx >= 0 ? emptyIdx : p.board.length
  game.value.deployBench(benchIndex, target)
  syncPlayer()
}

function recall(boardIndex) {
  game.value.recallBoard(boardIndex)
  syncPlayer()
}

function pickRune(id) {
  game.value.pickRune(id)
  selectedRuneOptions.value = []
  syncPlayer()
}

function fight() {
  const r = game.value.fight()
  if (r.over) {
    gameOver.value = true
    won.value = r.winner
  }
  syncPlayer()
}

/* 羁绊计算显示 */
const activeTraits = computed(() => {
  if (!game.value) return []
  const units = game.value.player.board.filter(u => u)
  return computeTraitBonuses(units)
})

/* 棋盘槽位：人口数 */
const boardSlots = computed(() => {
  const n = game.value ? game.value.player.level : 1
  return Array.from({ length: n }, (_, i) => i)
})

function backHome() {
  router.push({ name: 'home' })
}

function unitName(u) {
  return u.champ.name
}

function unitCost(u) {
  return u.champ.cost
}

function unitColor(u) {
  return COST_COLOR[u.champ.cost]
}

function starText(u) {
  return '★'.repeat(u.star)
}

onMounted(() => {
  startGame()
})
</script>

<template>
  <div class="game">
    <!-- 未开始 / 结束遮罩 -->
    <div v-if="gameOver" class="overlay">
      <div class="over-card" :class="{ win: won }">
        <h1>{{ won ? '🎉 吃鸡！' : '💀 出局' }}</h1>
        <p>{{ won ? '你成功活到了最后，登顶第一！' : '你的冒险到此结束，再来一局吧。' }}</p>
        <div class="over-btns">
          <button class="btn-primary" @click="startGame">再来一局</button>
          <button class="btn-ghost" @click="backHome">返回首页</button>
        </div>
      </div>
    </div>

    <!-- 符文选择遮罩 -->
    <div v-if="game && game.phase === 'rune'" class="overlay">
      <div class="over-card rune-card">
        <h2>选择强化符文</h2>
        <p class="rune-sub">强化符文将决定你这局的方向</p>
        <div class="rune-list">
          <button
            v-for="r in game.selectedRunes"
            :key="r.id"
            class="rune-opt"
            :class="'tier' + r.tier"
            @click="pickRune(r.id)"
          >
            <span class="rune-tier">{{ ['银', '金', '彩'][r.tier - 1] }}</span>
            <span class="rune-name">{{ r.name }}</span>
            <span class="rune-desc">{{ r.desc }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 顶部状态栏 -->
    <header class="topbar">
      <div class="t-left">
        <button class="back" @click="backHome">‹ 返回</button>
        <span class="round">回合 {{ game ? game.round : 1 }}</span>
      </div>
      <div class="hp-bar">
        <span class="hp-label">❤ {{ player.hp }}</span>
        <div class="hp-track"><div class="hp-fill" :style="{ width: player.hp + '%' }"></div></div>
      </div>
      <div class="gold">💰 {{ player.gold }}</div>
      <div class="t-right">
        <span class="lvl">人口 {{ player.level }}</span>
      </div>
    </header>

    <!-- 主区域 -->
    <div class="main">
      <!-- 棋盘 -->
      <section class="board">
        <div class="board-grid">
          <div
            v-for="(i, idx) in boardSlots"
            :key="idx"
            class="cell"
            :class="{ empty: !player.board[idx] }"
            @click="player.board[idx] && recall(idx)"
          >
            <template v-if="player.board[idx]">
              <div class="unit" :style="{ '--c': unitColor(player.board[idx]) }">
                <span class="unit-star">{{ starText(player.board[idx]) }}</span>
                <span class="unit-name">{{ unitName(player.board[idx]) }}</span>
                <span class="unit-cost">{{ COST_LABEL[unitCost(player.board[idx])] }}</span>
              </div>
            </template>
            <template v-else>
              <span class="cell-hint">空位</span>
            </template>
          </div>
        </div>
      </section>

      <!-- 右侧信息面板 -->
      <aside class="side">
        <!-- 激活羁绊 -->
        <div class="panel">
          <h3>激活羁绊</h3>
          <div v-if="activeTraits.length" class="trait-list">
            <div v-for="t in activeTraits" :key="t.trait" class="trait-item">
              <span class="trait-name">{{ t.trait }}</span>
              <span class="trait-tier">{{ t.tier }}人</span>
              <span class="trait-desc">{{ t.desc }}</span>
            </div>
          </div>
          <p v-else class="muted">暂无激活羁绊</p>
        </div>

        <!-- 已选符文 -->
        <div class="panel" v-if="player.runes.length">
          <h3>已选符文</h3>
          <div class="rune-owned">
            <span v-for="r in player.runes" :key="r.id" class="rune-chip">{{ r.name }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="panel actions">
          <button class="btn-primary big" @click="fight">⚔ 开始战斗</button>
          <div class="action-row">
            <button class="btn-ghost" @click="refresh">🔄 D牌 (2金币)</button>
            <button class="btn-ghost" @click="levelUp">⬆ 升级人口</button>
          </div>
        </div>
      </aside>
    </div>

    <!-- 商店 -->
    <section class="shop">
      <h3 class="shop-title">商店</h3>
      <div class="shop-grid">
        <div
          v-for="(c, i) in shop"
          :key="i"
          class="shop-slot"
          :class="{ sold: !c }"
          @click="c && buy(i)"
        >
          <template v-if="c">
            <div class="unit" :style="{ '--c': COST_COLOR[c.cost] }">
              <span class="unit-name">{{ c.name }}</span>
              <span class="unit-cost">{{ COST_LABEL[c.cost] }}</span>
            </div>
            <span class="price">{{ c.cost }} 金币</span>
          </template>
          <template v-else>
            <span class="sold-tag">已售</span>
          </template>
        </div>
      </div>
    </section>

    <!-- 备战席 -->
    <section class="bench">
      <h3 class="shop-title">备战席 (点击上阵)</h3>
      <div class="bench-grid">
        <div
          v-for="(u, i) in player.bench"
          :key="i"
          class="bench-slot"
          @click="deploy(i)"
          @contextmenu.prevent="sell(i)"
        >
          <div class="unit" :style="{ '--c': unitColor(u) }">
            <span class="unit-star">{{ starText(u) }}</span>
            <span class="unit-name">{{ unitName(u) }}</span>
            <span class="unit-cost">{{ COST_LABEL[unitCost(u)] }}</span>
          </div>
        </div>
        <div v-for="i in 9 - player.bench.length" :key="'e' + i" class="bench-slot empty-slot">
          <span class="cell-hint">空</span>
        </div>
      </div>
      <p class="muted hint">左键上阵 · 右键出售</p>
    </section>

    <!-- 日志 -->
    <section class="logs">
      <h3 class="shop-title">战报</h3>
      <div class="log-list">
        <p v-for="(l, i) in logs" :key="i" class="log-line">{{ l }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.game {
  min-height: 100vh;
  padding: 16px 20px 40px;
  background: radial-gradient(ellipse at 50% -10%, rgba(216, 180, 106, 0.08), transparent 50%),
    linear-gradient(180deg, #0c0e12, #12141f);
  color: #e6e2d6;
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

/* 遮罩 */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(6, 8, 16, 0.8);
  backdrop-filter: blur(6px);
}
.over-card {
  padding: 40px 48px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(180deg, rgba(32, 36, 60, 0.98), rgba(14, 17, 34, 0.99));
  border: 1px solid rgba(216, 180, 106, 0.35);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}
.over-card.win {
  border-color: rgba(111, 201, 164, 0.6);
}
.over-card h1 {
  font-size: 40px;
  margin: 0 0 12px;
  color: #f4efe2;
}
.over-card p {
  color: #8f98a6;
  margin: 0 0 24px;
}
.over-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 符文 */
.rune-card {
  width: min(520px, 92vw);
  text-align: left;
}
.rune-card h2 {
  text-align: center;
  color: #d8b46a;
  letter-spacing: 3px;
}
.rune-sub {
  text-align: center;
  margin-bottom: 20px !important;
}
.rune-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rune-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e6e2d6;
  font-family: inherit;
  transition: all 0.2s;
}
.rune-opt:hover {
  border-color: #d8b46a;
  background: rgba(216, 180, 106, 0.1);
}
.rune-tier {
  flex: 0 0 auto;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}
.tier1 .rune-tier { background: #9aa4af; color: #12142c; }
.tier2 .rune-tier { background: #d8b46a; color: #12142c; }
.tier3 .rune-tier { background: #e08bc4; color: #12142c; }
.rune-name {
  flex: 0 0 90px;
  font-weight: 700;
  color: #f4efe2;
}
.rune-desc {
  font-size: 12.5px;
  color: #8f98a6;
}

/* 顶栏 */
.topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(20, 23, 36, 0.9);
  border: 1px solid rgba(216, 180, 106, 0.2);
  margin-bottom: 16px;
}
.t-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e6e2d6;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}
.round {
  font-weight: 700;
  color: #d8b46a;
  letter-spacing: 1px;
}
.hp-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.hp-label {
  color: #ff8f8f;
  font-weight: 700;
  white-space: nowrap;
}
.hp-track {
  flex: 1;
  height: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #ff8f8f);
  transition: width 0.4s;
}
.gold {
  font-weight: 700;
  color: #d8b46a;
  white-space: nowrap;
}
.t-right .lvl {
  font-weight: 700;
  color: #6fc9a4;
}

/* 主区 */
.main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.board {
  flex: 1;
  min-height: 320px;
  border-radius: 16px;
  padding: 16px;
  background: rgba(20, 23, 36, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.board-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.cell {
  aspect-ratio: 1;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
}
.cell:not(.empty):hover {
  border-color: #e74c3c;
}
.cell-hint {
  font-size: 12px;
  color: #5a5f70;
}

.side {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panel {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(20, 23, 36, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.panel h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #d8b46a;
  letter-spacing: 1px;
}
.trait-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.trait-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}
.trait-name {
  font-weight: 700;
  color: #6fc9a4;
}
.trait-tier {
  padding: 2px 8px;
  border-radius: 5px;
  background: rgba(111, 201, 164, 0.15);
  color: #6fc9a4;
}
.trait-desc {
  color: #8f98a6;
  font-size: 11.5px;
}
.muted {
  color: #8f98a6;
  font-size: 12.5px;
  margin: 0;
}
.rune-owned {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rune-chip {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(216, 180, 106, 0.12);
  border: 1px solid rgba(216, 180, 106, 0.3);
  color: #d8b46a;
}
.actions .btn-primary.big {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-bottom: 8px;
}
.action-row {
  display: flex;
  gap: 8px;
}

/* 单位卡片 */
.unit {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 25%, #1a1d30), #14172a);
  border: 2px solid var(--c);
  box-shadow: 0 0 12px color-mix(in srgb, var(--c) 30%, transparent);
}
.unit-star {
  font-size: 11px;
  color: #f0b429;
  letter-spacing: 1px;
}
.unit-name {
  font-size: 13px;
  font-weight: 700;
  color: #f4efe2;
  text-align: center;
  padding: 0 4px;
}
.unit-cost {
  font-size: 10px;
  color: var(--c);
  font-weight: 700;
}

/* 商店 */
.shop, .bench, .logs {
  margin-top: 16px;
}
.shop-title {
  font-size: 14px;
  color: #d8b46a;
  letter-spacing: 1px;
  margin: 0 0 10px;
}
.shop-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.shop-slot {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(20, 23, 36, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
  overflow: hidden;
}
.shop-slot:not(.sold):hover {
  border-color: #d8b46a;
  transform: translateY(-2px);
}
.shop-slot .unit {
  border-radius: 0;
  border: none;
  box-shadow: none;
}
.price {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #d8b46a;
  background: rgba(0, 0, 0, 0.6);
  padding: 1px 8px;
  border-radius: 4px;
}
.sold-tag {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #5a5f70;
}

/* 备战席 */
.bench-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
}
.bench-slot {
  aspect-ratio: 1;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(20, 23, 36, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}
.bench-slot:not(.empty-slot):hover {
  border-color: #6fc9a4;
  transform: translateY(-2px);
}
.bench-slot .unit {
  border-radius: 8px;
}
.empty-slot {
  display: grid;
  place-items: center;
  border-style: dashed;
}
.hint {
  margin-top: 8px;
  color: #5a5f70;
  font-size: 12px;
}

/* 日志 */
.log-list {
  max-height: 160px;
  overflow-y: auto;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(20, 23, 36, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.log-line {
  font-size: 12px;
  color: #8f98a6;
  margin: 3px 0;
}

/* 按钮 */
.btn-primary {
  background: linear-gradient(180deg, #d8b46a, #c09a4a);
  color: #1a1408;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-primary:hover {
  filter: brightness(1.08);
}
.btn-ghost {
  background: transparent;
  border: 1px solid rgba(216, 180, 106, 0.4);
  color: #d8b46a;
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-family: inherit;
  flex: 1;
  transition: all 0.2s;
}
.btn-ghost:hover {
  background: rgba(216, 180, 106, 0.1);
}

@media (max-width: 860px) {
  .main {
    flex-direction: column;
  }
  .side {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .side .panel {
    flex: 1;
    min-width: 200px;
  }
  .board-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .bench-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  .shop-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
