<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CHAMPIONS, TRAITS, BASE_ITEMS, FULL_ITEMS, COST_COLOR, COST_LABEL
} from '../data/gameData'
import { Game, computeTraitBonuses } from '../data/gameEngine'
import { getSavedUser } from '../utils/auth'
import userAvatar from '../assets/user-avatar.jpeg'

const router = useRouter()

/* 当前登录用户名（与首页一致：nickName || username） */
const savedUser = getSavedUser()
const playerName = savedUser.nickName || savedUser.username || '召唤师'

const game = ref(null)
const started = ref(false)
const gameOver = ref(false)
const won = ref(false)
const logs = ref([])
const shop = ref([])
const selectedRuneOptions = ref([])

/* ---------- 战斗动画状态 ---------- */
const battle = ref(null)          // { ally:[], enemy:[], events:[], won }
const battleActive = ref(false)   // 是否正在播放战斗画面
const byeTip = ref(false)         // 玩家轮空提示
const battleEventIdx = ref(0)     // 当前播放到第几个事件
const battlePhase = ref('')       // 'intro' | 'fight' | 'result'
let battleTimers = []             // 清理用定时器

/* 战斗单位实时血量映射（side:idx -> curHp），用于血条 */
const battleHp = reactive({ ally: {}, enemy: {} })
/* 当前攻击方/受击方索引（冲撞高亮） */
const battleAtk = reactive({ side: '', idx: -1 })
const battleDef = reactive({ side: '', idx: -1 })

/* 响应式玩家状态快照 */
const player = reactive({
  hp: 100, gold: 10, level: 1, xp: 0,
  board: [], bench: [], runes: [], baseItems: [], winStreak: 0, loseStreak: 0
})

/* 7 个人机对手 */
const opponents = reactive([])
const currentEnemy = ref(null)

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
  // 同步对手（按血量从高到低排序），玩家「我」排最前
  opponents.length = 0
  opponents.push({ name: playerName, avatar: userAvatar, hp: p.hp, level: p.level, alive: p.alive, isMe: true })
  const sortedAis = [...game.value.ais].sort((x, y) => y.hp - x.hp)
  for (const a of sortedAis) {
    opponents.push({ name: a.name, avatar: a.avatar, hp: a.hp, level: a.level, alive: a.alive, isMe: false })
  }
  currentEnemy.value = game.value.currentEnemy ? game.value.currentEnemy.name : null
}

function startGame() {
  game.value = new Game(playerName)
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
  // 每次战斗都播放战斗动画画面
  if (r.result && r.result.roster) {
    playBattle(r.result.roster, r.result.events, r.result.aWin, r)
  } else if (!r.over) {
    // 玩家轮空：轻量提示
    byeTip.value = true
    setTimeout(() => { byeTip.value = false }, 1600)
  }
  if (r.over) {
    gameOver.value = true
    won.value = r.winner
  }
  syncPlayer()
}

/* 播放战斗动画：入场 → 逐事件对砍 → 结算 */
function playBattle(roster, events, won, r) {
  clearBattle()
  deadUnits.ally.clear()
  deadUnits.enemy.clear()

  // 初始化双方单位（加入 curHp/maxHp 用于血条）
  const ally = roster.ally.map(u => ({ ...u, maxHp: u.hp, curHp: u.hp }))
  const enemy = roster.enemy.map(u => ({ ...u, maxHp: u.hp, curHp: u.hp }))

  battle.value = {
    ally,
    enemy,
    events: events || [],
    won: !!won,
    enemyName: (r && r.result && r.result.enemy && r.result.enemy.name) || '敌方',
    defIdx: -1,
    atkName: '',
    defName: '',
    dmg: 0,
    crit: false,
    kill: false
  }
  // 重置血条映射
  battleHp.ally = {}
  battleHp.enemy = {}
  ally.forEach((u, i) => { battleHp.ally[i] = u.curHp })
  enemy.forEach((u, i) => { battleHp.enemy[i] = u.curHp })

  battleActive.value = true
  battleEventIdx.value = 0
  battlePhase.value = 'intro'

  // 入场阶段（约 1.4 秒后进入对砍）
  battleTimers.push(setTimeout(() => {
    battlePhase.value = 'fight'
    playNextEvent()
  }, 1400))
}

function playNextEvent() {
  const b = battle.value
  if (!b) return
  const ev = b.events[battleEventIdx.value]
  if (!ev) {
    // 事件播放完毕 → 结算
    battlePhase.value = 'result'
    battleAtk.side = ''
    battleDef.side = ''
    battleTimers.push(setTimeout(() => {
      battleActive.value = false
      battle.value = null
    }, 1800))
    return
  }
  // 设置当前事件
  b.atkName = ev.atkName
  b.defName = ev.defName
  b.dmg = ev.dmg
  b.crit = !!ev.crit
  b.kill = ev.kill
  battleAtk.side = ev.atkSide
  battleAtk.idx = ev.atkIdx
  battleDef.side = ev.defSide
  battleDef.idx = ev.defIdx

  // 扣血：更新受击方当前血量
  const sideKey = ev.defSide === 'ally' ? 'ally' : 'enemy'
  const unit = b[sideKey][ev.defIdx]
  if (unit) {
    unit.curHp = Math.max(0, unit.curHp - ev.dmg)
    battleHp[sideKey][ev.defIdx] = unit.curHp
  }
  if (ev.kill) {
    if (ev.defSide === 'enemy') deadUnits.enemy.add(ev.defIdx)
    else deadUnits.ally.add(ev.defIdx)
  }
  battleEventIdx.value++

  // 每个事件约 300ms，之后播下一个
  battleTimers.push(setTimeout(playNextEvent, 300))
}

function clearBattle() {
  battleTimers.forEach(t => clearTimeout(t))
  battleTimers = []
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

/* 战斗动画：判断某单位是否已阵亡（按名字，简化标记） */
const deadUnits = reactive({ ally: new Set(), enemy: new Set() })
function unitDead(side, i) {
  return deadUnits[side].has(i)
}

/* 战斗动画：计算血条百分比 */
function hpPct(side, i) {
  const u = battle.value ? battle.value[side][i] : null
  if (!u) return 0
  return Math.max(0, Math.round((u.curHp / u.maxHp) * 100))
}

function unitCost(u) {
  return u.champ.cost
}

function unitColor(u) {
  return COST_COLOR[u.champ.cost]
}

/* 取单位头像：u 可能是 unit({champ}) 或 champ 对象 */
function unitAvatar(u) {
  const c = u.champ || u
  return c.avatar || null
}

function unitFirstName(u) {
  return unitName(u)[0]
}

function starText(u) {
  return '★'.repeat(u.star)
}

/* ---------- 装备相关 ---------- */
const selectedItemIdx = ref(-1)  // 当前选中要操作的装备索引（-1 未选）

function itemById(id) {
  return BASE_ITEMS.find(x => x.id === id) || FULL_ITEMS.find(x => x.id === id)
}

/* 装备图片 */
function itemImg(it) {
  return it && it.img ? it.img : null
}

/* 判断某装备是散件还是成装 */
function isBaseItem(it) {
  return it && BASE_ITEMS.some(x => x.id === it.id)
}

/* 佩戴装备：selectedItemIdx 选中的装备 → 目标棋盘单位 */
function onBoardClick(idx) {
  const u = player.board[idx]
  if (selectedItemIdx.value >= 0) {
    // 佩戴模式
    if (u) {
      game.value.equipItem(selectedItemIdx.value, idx)
      selectedItemIdx.value = -1
      syncPlayer()
    }
    return
  }
  // 普通模式：召回
  if (u) recall(idx)
}

/* 点背包里的装备：
 * - 未选中 → 选中该装备
 * - 再点自己 → 取消选中
 * - 已选中另一个散件 → 尝试合成成装 */
function selectItem(idx) {
  if (selectedItemIdx.value < 0) {
    selectedItemIdx.value = idx
    return
  }
  if (selectedItemIdx.value === idx) {
    selectedItemIdx.value = -1
    return
  }
  // 已选中另一个 → 尝试合成
  const a = player.baseItems[selectedItemIdx.value]
  const b = player.baseItems[idx]
  if (a && b) {
    const fi = game.value.combineTwoInBag(selectedItemIdx.value, idx)
    selectedItemIdx.value = -1
    syncPlayer()
    if (!fi) {
      // 合成失败（两个散件不匹配），选中后点的那个
      selectedItemIdx.value = -1
    }
  }
}

/* 取下单位装备 */
function unequip(boardIdx, itemId) {
  game.value.unequipItem(boardIdx, itemId)
  syncPlayer()
}

/* 获取单位已装装备（用于卡片显示图标） */
function unitItems(u) {
  return (u.items || []).map(id => itemById(id)).filter(Boolean)
}

onMounted(() => {
  startGame()
})

onUnmounted(() => {
  clearBattle()
})
</script>

<template>
  <div class="game">
    <!-- 战斗动画遮罩（金铲铲风格上下对弈棋盘） -->
    <div v-if="battleActive && battle" class="battle-overlay">
      <div class="battle-stage">
        <!-- 顶部 VS 横幅 -->
        <div class="battle-vs">
          <span class="b-side enemy-side">{{ battle.enemyName }}</span>
          <span class="b-vs">⚔</span>
          <span class="b-side ally-side">我方</span>
        </div>

        <!-- 对战棋盘：上敌下我 -->
        <div class="battle-board">
          <!-- 敌方（上） -->
          <div class="board-row enemy-row">
            <div
              v-for="(u, i) in battle.enemy"
              :key="'e' + i"
              class="b-cell"
              :class="{
                'is-atk': battleAtk.side === 'enemy' && battleAtk.idx === i,
                'is-def': battleDef.side === 'enemy' && battleDef.idx === i,
                dead: unitDead('enemy', i)
              }"
            >
              <div class="b-unit enemy-unit" :style="{ '--c': COST_COLOR[u.cost] }">
                <img v-if="u.avatar" class="b-face" :src="u.avatar" :alt="u.name" draggable="false" />
                <span v-else class="b-icon">{{ u.name[0] }}</span>
                <span class="b-star">{{ '★'.repeat(u.star) }}</span>
                <span class="b-name">{{ u.name }}</span>
                <span class="b-hpbar"><i :style="{ width: hpPct('enemy', i) + '%' }"></i></span>
              </div>
              <span v-if="battleDef.side === 'enemy' && battleDef.idx === i" class="b-dmg-float" :class="{ crit: battle.crit, kill: battle.kill }">-{{ battle.dmg }}</span>
            </div>
          </div>

          <!-- 中场线 + 中央信息 -->
          <div class="battle-mid">
            <template v-if="battlePhase === 'fight'">
              <span class="b-action">{{ battle.atkName }} → {{ battle.defName }}</span>
            </template>
            <template v-else-if="battlePhase === 'intro'">
              <span class="b-msg">战斗开始！</span>
            </template>
            <template v-else>
              <span class="b-msg result" :class="{ win: battle.won }">{{ battle.won ? '🎉 胜利！' : '💥 战败…' }}</span>
            </template>
          </div>

          <!-- 我方（下） -->
          <div class="board-row ally-row">
            <div
              v-for="(u, i) in battle.ally"
              :key="'a' + i"
              class="b-cell"
              :class="{
                'is-atk': battleAtk.side === 'ally' && battleAtk.idx === i,
                'is-def': battleDef.side === 'ally' && battleDef.idx === i,
                dead: unitDead('ally', i)
              }"
            >
              <div class="b-unit ally-unit" :style="{ '--c': COST_COLOR[u.cost] }">
                <img v-if="u.avatar" class="b-face" :src="u.avatar" :alt="u.name" draggable="false" />
                <span v-else class="b-icon">{{ u.name[0] }}</span>
                <span class="b-star">{{ '★'.repeat(u.star) }}</span>
                <span class="b-name">{{ u.name }}</span>
                <span class="b-hpbar"><i :style="{ width: hpPct('ally', i) + '%' }"></i></span>
              </div>
              <span v-if="battleDef.side === 'ally' && battleDef.idx === i" class="b-dmg-float" :class="{ crit: battle.crit, kill: battle.kill }">-{{ battle.dmg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 轮空提示遮罩 -->
    <div v-if="byeTip" class="bye-overlay">
      <div class="bye-card">🛡 本轮轮空</div>
    </div>

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
            :class="{ empty: !player.board[idx], equipping: selectedItemIdx >= 0 }"
            @click="onBoardClick(idx)"
          >
            <template v-if="player.board[idx]">
              <div class="unit" :style="{ '--c': unitColor(player.board[idx]) }">
                <img v-if="unitAvatar(player.board[idx])" class="unit-face" :src="unitAvatar(player.board[idx])" :alt="unitName(player.board[idx])" draggable="false" />
                <span v-else class="unit-first">{{ unitFirstName(player.board[idx]) }}</span>
                <span class="unit-star">{{ starText(player.board[idx]) }}</span>
                <span class="unit-name">{{ unitName(player.board[idx]) }}</span>
                <span class="unit-cost">{{ COST_LABEL[unitCost(player.board[idx])] }}</span>
                <!-- 已装装备图标 -->
                <span class="unit-items" v-if="unitItems(player.board[idx]).length">
                  <span
                    v-for="(it, ii) in unitItems(player.board[idx])"
                    :key="ii"
                    class="unit-item-icon"
                    :title="it.name + '：' + (it.desc || it.stat)"
                    @click.stop="unequip(idx, it.id)"
                  >
                    <img v-if="itemImg(it)" class="unit-item-img" :src="itemImg(it)" :alt="it.name" draggable="false" />
                    <span v-else>{{ it.name[0] }}</span>
                  </span>
                </span>
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

        <!-- 玩家列表（我 + 7 个人机） -->
        <div class="panel">
          <h3>玩家（存活 {{ opponents.filter(o => o.alive).length }}/8）</h3>
          <div class="opp-list">
            <div
              v-for="o in opponents"
              :key="o.name + o.isMe"
              class="opp-item"
              :class="{ dead: !o.alive, current: o.name === currentEnemy, me: o.isMe }"
            >
              <div class="opp-face">
                <img v-if="o.avatar" :src="o.avatar" :alt="o.name" draggable="false" />
                <span v-else>{{ o.name[o.name.length - 1] }}</span>
              </div>
              <div class="opp-info">
                <span class="opp-name">{{ o.name }}</span>
                <div class="opp-hpbar">
                  <i :style="{ width: (o.alive ? o.hp : 0) + '%' }"></i>
                </div>
              </div>
              <span class="opp-hp">{{ o.alive ? o.hp : '出局' }}</span>
            </div>
          </div>
        </div>

        <!-- 散件背包 -->
        <div class="panel">
          <h3>装备背包（{{ player.baseItems.length }}/12）</h3>
          <div v-if="player.baseItems.length" class="item-bag">
            <div
              v-for="(it, i) in player.baseItems"
              :key="i"
              class="item-bag-slot"
              :class="{ selected: selectedItemIdx === i }"
              :title="itemById(it.id).name + '：' + (itemById(it.id).desc || itemById(it.id).stat)"
              @click="selectItem(i)"
            >
              <img v-if="itemImg(itemById(it.id))" class="item-bag-img" :src="itemImg(itemById(it.id))" :alt="itemById(it.id).name" draggable="false" />
              <span v-else class="item-bag-icon">{{ itemById(it.id).name[0] }}</span>
            </div>
          </div>
          <p v-else class="muted">暂无装备，野怪回合获胜可掉落散件</p>
          <p v-if="selectedItemIdx >= 0" class="muted equip-hint">
            已选中「{{ itemById(player.baseItems[selectedItemIdx].id).name }}」：
            再点另一个散件合成成装，或点棋盘上的英雄佩戴
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="panel actions">
          <p v-if="currentEnemy" class="muted next-fight">⚔ 当前对战：<b>{{ currentEnemy }}</b></p>
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
              <img v-if="c.avatar" class="unit-face" :src="c.avatar" :alt="c.name" draggable="false" />
              <span v-else class="unit-first">{{ c.name[0] }}</span>
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
            <img v-if="unitAvatar(u)" class="unit-face" :src="unitAvatar(u)" :alt="unitName(u)" draggable="false" />
            <span v-else class="unit-first">{{ unitFirstName(u) }}</span>
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
  background:
    radial-gradient(ellipse at 50% -10%, rgba(240, 200, 120, 0.28), transparent 55%),
    radial-gradient(ellipse at 15% 20%, rgba(216, 180, 106, 0.14), transparent 45%),
    radial-gradient(ellipse at 85% 30%, rgba(192, 154, 74, 0.16), transparent 45%),
    linear-gradient(180deg, #241a0c 0%, #1a1408 45%, #120d06 100%);
  color: #f3e9cf;
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
.bye-overlay {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: grid;
  place-items: center;
  background: rgba(6, 8, 16, 0.55);
  backdrop-filter: blur(3px);
  pointer-events: none;
}
.bye-card {
  padding: 28px 56px;
  border-radius: 16px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #d8b46a;
  background: linear-gradient(180deg, rgba(32, 36, 60, 0.96), rgba(14, 17, 34, 0.98));
  border: 1px solid rgba(216, 180, 106, 0.4);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  animation: byePop 0.35s ease;
}
@keyframes byePop {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
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
  background: rgba(46, 35, 17, 0.9);
  border: 1px solid rgba(216, 180, 106, 0.3);
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
  background: linear-gradient(180deg, rgba(58, 44, 20, 0.65), rgba(36, 27, 12, 0.72));
  border: 1px solid rgba(216, 180, 106, 0.28);
  box-shadow: inset 0 0 40px rgba(216, 180, 106, 0.08);
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
  background: rgba(216, 180, 106, 0.05);
  border: 1px dashed rgba(216, 180, 106, 0.28);
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
  background: rgba(42, 33, 18, 0.7);
  border: 1px solid rgba(216, 180, 106, 0.22);
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

/* 对手栏 */
.opp-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.opp-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}
.opp-item.current {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.12);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.25);
}
.opp-item.dead {
  opacity: 0.35;
  filter: grayscale(1);
}
.opp-item.me {
  border-color: #6fc9a4;
  background: rgba(111, 201, 164, 0.14);
  box-shadow: 0 0 10px rgba(111, 201, 164, 0.25);
}
.opp-item.me .opp-name {
  color: #6fc9a4;
}
.opp-face {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(216, 180, 106, 0.5);
  background: rgba(216, 180, 106, 0.15);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #d8b46a;
}
.opp-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.opp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.opp-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #f4efe2;
}
.opp-hpbar {
  height: 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
.opp-hpbar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #e74c3c, #ff8f8f);
  transition: width 0.4s;
}
.opp-hp {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
  color: #ff8f8f;
  min-width: 32px;
  text-align: right;
}

/* 散件背包 */
.item-bag {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.item-bag-slot {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
  background: rgba(216, 180, 106, 0.1);
  border: 2px solid rgba(216, 180, 106, 0.4);
  transition: all 0.2s;
  overflow: hidden;
}
.item-bag-slot:hover {
  transform: translateY(-2px);
  border-color: #d8b46a;
}
.item-bag-slot.selected {
  border-color: #6fc9a4;
  background: rgba(111, 201, 164, 0.18);
  box-shadow: 0 0 12px rgba(111, 201, 164, 0.5);
}
.item-bag-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.item-bag-icon {
  font-size: 18px;
  font-weight: 700;
  color: #d8b46a;
}
.equip-hint {
  margin-top: 8px;
  color: #6fc9a4;
}

/* 棋盘佩戴高亮 */
.cell.equipping {
  border-color: #6fc9a4;
  box-shadow: 0 0 10px rgba(111, 201, 164, 0.3);
}

/* 单位卡片上的装备图标 */
.unit-items {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 2px;
  z-index: 3;
}
.unit-item-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #1a1307;
  background: linear-gradient(180deg, #e8c87a, #c09a4a);
  border: 1px solid rgba(0, 0, 0, 0.4);
  cursor: pointer;
  text-shadow: none;
  overflow: hidden;
}
.unit-item-icon:hover {
  border-color: #ff8f8f;
}
.unit-item-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.actions .btn-primary.big {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-bottom: 8px;
}
.next-fight {
  margin-bottom: 10px;
  color: #d8b46a;
}
.next-fight b {
  color: #ff8f8f;
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
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 25%, #3a2e18), #2a2010);
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
.unit-face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0.92;
}
.unit-first {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 26px;
  font-weight: 900;
  color: color-mix(in srgb, var(--c) 60%, #fff);
  border-radius: 8px;
}
.unit .unit-star,
.unit .unit-name,
.unit .unit-cost {
  position: relative;
  z-index: 2;
}
.unit-name {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}
.unit-star {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
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
  background: rgba(46, 35, 17, 0.7);
  border: 1px solid rgba(216, 180, 106, 0.18);
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
  background: rgba(46, 35, 17, 0.7);
  border: 1px solid rgba(216, 180, 106, 0.18);
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
  background: rgba(46, 35, 17, 0.5);
  border: 1px solid rgba(216, 180, 106, 0.14);
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

/* ============ 战斗动画（金铲铲风格上下对弈棋盘） ============ */
.battle-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  background: radial-gradient(ellipse at center, rgba(48, 34, 14, 0.92), rgba(8, 6, 2, 0.98));
  backdrop-filter: blur(5px);
  animation: battleFade 0.3s ease;
}
@keyframes battleFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.battle-stage {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 0;
  background: linear-gradient(180deg, rgba(52, 38, 18, 0.98), rgba(16, 11, 4, 0.99));
  border: none;
  box-shadow: inset 0 0 80px rgba(216, 180, 106, 0.06);
}
.battle-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 18px;
}
.b-side {
  font-weight: 700;
  letter-spacing: 3px;
  font-size: 26px;
}
.ally-side { color: #6fc9a4; text-shadow: 0 0 10px rgba(111, 201, 164, 0.4); }
.enemy-side { color: #ff8f8f; text-shadow: 0 0 10px rgba(255, 143, 143, 0.4); }
.b-vs {
  font-size: 40px;
  color: #d8b46a;
  text-shadow: 0 0 16px rgba(216, 180, 106, 0.7);
}

/* 棋盘 */
.battle-board {
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
  background:
    linear-gradient(45deg, rgba(216, 180, 106, 0.04) 25%, transparent 25%, transparent 75%, rgba(216, 180, 106, 0.04) 75%),
    linear-gradient(45deg, rgba(216, 180, 106, 0.04) 25%, transparent 25%, transparent 75%, rgba(216, 180, 106, 0.04) 75%),
    rgba(30, 22, 10, 0.85);
  background-size: 32px 32px, 32px 32px, auto;
  background-position: 0 0, 16px 16px, 0 0;
  border: none;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
}
.board-row {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 0 16px;
  min-height: 140px;
}
.enemy-row .b-unit {
  border-color: color-mix(in srgb, var(--c) 70%, #ff8f8f);
}
.ally-row .b-unit {
  border-color: color-mix(in srgb, var(--c) 70%, #6fc9a4);
}

.b-cell {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  background: rgba(216, 180, 106, 0.05);
  border: 1px dashed rgba(216, 180, 106, 0.22);
}
.b-cell.dead {
  opacity: 0.2;
  filter: grayscale(1);
}
.b-cell.is-atk .b-unit {
  animation: atkLunge 0.4s ease;
  z-index: 5;
}
@keyframes atkLunge {
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(var(--lunge, -10px)) scale(1.12); }
  100% { transform: translateY(0) scale(1); }
}
.enemy-row .b-cell.is-atk .b-unit { --lunge: 12px; }
.ally-row .b-cell.is-atk .b-unit { --lunge: -12px; }
.b-cell.is-def .b-unit {
  animation: defShake 0.4s ease;
}
@keyframes defShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-3px); }
}

.b-unit {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 24%, #2c2110), #1a1307);
  border: 2px solid var(--c);
  box-shadow: 0 0 12px color-mix(in srgb, var(--c) 35%, transparent);
  transition: opacity 0.3s, filter 0.3s;
  overflow: hidden;
}
.b-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 32px;
  font-weight: 900;
  color: #1a1307;
  background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 55%, #000));
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 8px color-mix(in srgb, var(--c) 60%, transparent);
}
.b-face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  border-radius: 8px;
  opacity: 0.95;
}
.b-star {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 16px;
  color: #f0b429;
  letter-spacing: 1px;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}
.b-name {
  position: relative;
  z-index: 2;
  font-size: 17px;
  font-weight: 700;
  color: #f4efe2;
  text-align: center;
  padding: 0 4px;
  line-height: 1.1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}
.b-hpbar {
  position: relative;
  z-index: 2;
  width: 80%;
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  margin-bottom: 4px;
}
.b-hpbar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #e74c3c, #ff8f8f);
  transition: width 0.25s ease;
}

/* 掉血飘字 */
.b-dmg-float {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  font-weight: 900;
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.8);
  pointer-events: none;
  z-index: 10;
  animation: dmgFloat 0.7s ease forwards;
}
.b-dmg-float.crit {
  color: #f0b429;
  font-size: 38px;
  text-shadow: 0 0 14px rgba(240, 180, 41, 0.9);
}
.b-dmg-float.kill {
  color: #ff4d4d;
}
@keyframes dmgFloat {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
  30% { opacity: 1; transform: translate(-50%, -10px) scale(1.15); }
  100% { opacity: 0; transform: translate(-50%, -34px) scale(1); }
}

/* 中场信息 */
.battle-mid {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 4px 0;
  text-align: center;
}
.b-action {
  font-size: 17px;
  color: #d8b46a;
}
.b-msg {
  font-size: 32px;
  font-weight: 700;
  color: #e6e2d6;
  letter-spacing: 3px;
}
.b-msg.result.win {
  color: #6fc9a4;
  text-shadow: 0 0 16px rgba(111, 201, 164, 0.6);
}
.b-msg.result:not(.win) {
  color: #ff8f8f;
  text-shadow: 0 0 16px rgba(255, 143, 143, 0.6);
}

@media (max-width: 720px) {
  .board-row {
    grid-template-columns: repeat(4, 1fr);
    min-height: 90px;
  }
  .b-icon {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }
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
