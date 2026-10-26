<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, clearLogin, getSavedUser } from '../utils/auth'
import {
  HEROES as STATIC_HEROES,
  ITEMS as STATIC_ITEMS,
  TRAITS as STATIC_TRAITS,
  COST_COLOR,
  COST_LABEL,
  STAT_MAX,
  STAT_LABEL
} from '../data/codex'
import ItemIcon from '../components/ItemIcon.vue'
import TraitIcon from '../components/TraitIcon.vue'
import { heroAvatar, heroSplash } from '../data/heroAvatars'

const router = useRouter()

/* ---------------- 图鉴数据 ----------------
 * 数据源：后端 /api/codex/*（由后台管理系统维护）
 * 拉取失败时回退到 codex.js 静态数据，保证页面始终可用 */
const heroes = ref(STATIC_HEROES)
const items = ref(STATIC_ITEMS)
const traits = ref(STATIC_TRAITS)

/** 安全解析后端 JSON 列字符串 */
function parseJsonCol(s, fallback) {
  if (s == null || s === '') return fallback
  try {
    const v = JSON.parse(s)
    return v == null ? fallback : v
  } catch (e) {
    return fallback
  }
}

function heroFromApi(r) {
  return {
    id: r.id,
    name: r.name,
    en: r.en || '',
    cost: r.cost,
    traits: parseJsonCol(r.traits, []),
    role: r.role || '',
    tagline: r.tagline || '',
    skill: { name: r.skillName || '', desc: r.skillDesc || '' },
    stats: parseJsonCol(r.stats, {}),
    items: parseJsonCol(r.items, []),
    tip: r.tip || ''
  }
}

function itemFromApi(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    recipe: parseJsonCol(r.recipe, null),
    stats: r.stats || '',
    desc: r.desc || '',
    for: parseJsonCol(r.forHeroes, [])
  }
}

function traitFromApi(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    icon: r.icon || '',
    tiers: parseJsonCol(r.tiers, []),
    tip: r.tip || ''
  }
}

async function loadCodex() {
  try {
    const [h, i, t] = await Promise.all([
      api('/api/codex/heroes'),
      api('/api/codex/items'),
      api('/api/codex/traits')
    ])
    if (Array.isArray(h) && h.length) heroes.value = h.map(heroFromApi)
    if (Array.isArray(i) && i.length) items.value = i.map(itemFromApi)
    if (Array.isArray(t) && t.length) traits.value = t.map(traitFromApi)
  } catch (e) {
    /* 后端不可用：保持 codex.js 静态数据兜底 */
  }
}

/** 拥有某羁绊的英雄列表 */
function heroesOfTrait(traitName) {
  return heroes.value.filter((h) => h.traits.includes(traitName))
}

/** 由基础散件可合成的装备名列表 */
function itemsFromBase(baseName) {
  return items.value
    .filter((it) => it.recipe && it.recipe.includes(baseName))
    .map((it) => it.name)
}

/* ---------------- 登录态与用户信息 ---------------- */
const profile = ref({
  username: getSavedUser().username || '',
  nickName: getSavedUser().nickName || '',
  createTime: '',
  perm: getSavedUser().perm ?? 1
})

/** 是否具备后台管理员权限：perm = 0 才是管理员，1 为普通用户 */
const isAdmin = computed(() => profile.value.perm === 0)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loadCodex() // 图鉴数据异步拉取，不阻塞页面
  try {
    profile.value = await api('/api/me')
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
})

async function onLogout() {
  try { await api('/api/logout', { method: 'POST' }) } catch (e) { /* 后端不可达也照样退出 */ }
  clearLogin()
  router.push({ name: 'landing' })
}

function goProfile() {
  router.push({ name: 'profile' })
}

/* 进后台管理系统（图鉴数据管理）；未登录后台会先落到后台登录页 */
function goAdmin() {
  router.push({ name: 'adminLogin' })
}

function avatarText(name) {
  return (name || '?').slice(0, 1).toUpperCase()
}

function formatDate(v) {
  if (!v) return '未知'
  return String(v).slice(0, 10).replace(/-/g, '.')
}

/* ---------------- 战斗数据（演示） ---------------- */
const seasonStats = [
  { label: '总对局', value: '128' },
  { label: '前四率', value: '62%' },
  { label: '吃鸡率', value: '18%' },
  { label: '最高连胜', value: '7' }
]

/* ---------------- 图鉴切换与筛选 ---------------- */
const tab = ref('hero') // hero | item | trait

const heroCost = ref('all')
const heroTrait = ref('all')
const heroKw = ref('')
const itemKind = ref('all') // all | 基础 | 合成
const itemKw = ref('')
const traitKind = ref('all') // all | 职业 | 种族
const traitKw = ref('')

const heroList = computed(() =>
  heroes.value.filter((h) => {
    if (heroCost.value !== 'all' && h.cost !== Number(heroCost.value)) return false
    if (heroTrait.value !== 'all' && !h.traits.includes(heroTrait.value)) return false
    const kw = heroKw.value.trim().toLowerCase()
    if (kw && !(h.name.includes(kw) || h.en.toLowerCase().includes(kw))) return false
    return true
  })
)

const itemList = computed(() =>
  items.value.filter((it) => {
    if (itemKind.value !== 'all' && it.type !== itemKind.value) return false
    const kw = itemKw.value.trim()
    if (kw && !it.name.includes(kw)) return false
    return true
  })
)

const traitList = computed(() =>
  traits.value.filter((t) => {
    if (traitKind.value !== 'all' && t.type !== traitKind.value) return false
    const kw = traitKw.value.trim()
    if (kw && !t.name.includes(kw)) return false
    return true
  })
)

/* ---------------- 详情面板 ---------------- */
const detail = ref(null) // { kind: 'hero'|'item'|'trait', data: {} }

/* ---------------- 头像放大查看 ----------------
 * 规则：
 *   点任意一个头像  -> 2K 立绘放大到页面的 1/2，并保持原始比例（不拉伸、不发虚）
 *   再点页面上任意一处 -> 退出放大，回到原界面
 * 动画：从被点头像的位置与尺寸平滑放大到屏幕中央（FLIP），关闭时原路缩回
 * 素材：heroSplash() 返回 2K 版本（见 scripts/upscale-splash-2k.py）
 */
const ZOOM_MS = 380
const zoom = ref(null) // { url, name, phase: 'prepare' | 'in' | 'out', firstStyle }
const zoomBox = ref(null)
let zoomTimer = null

/* 已预热的 2K 图，避免重复请求 */
const warmed = new Set()
function warmHero(name) {
  const url = heroSplash(name)
  if (url && !warmed.has(url)) {
    warmed.add(url)
    const im = new Image()
    im.src = url
  }
}

/** 点头像 -> 放大 */
async function openZoom(name, ev) {
  if (zoom.value) return
  const url = heroSplash(name)
  if (!url) return // 没有可用立绘时不处理

  const el = ev?.currentTarget
  const r = el?.getBoundingClientRect?.()
  const from =
    r && r.width
      ? { cx: r.left + r.width / 2, cy: r.top + r.height / 2, size: Math.max(r.width, r.height) }
      : null

  clearTimeout(zoomTimer)
  zoom.value = { url, name, phase: 'prepare', from, firstStyle: null }

  // 等 DOM 出来后测量目标尺寸，算出「起点样式」
  await nextTick()
  const box = zoomBox.value
  if (!box || !zoom.value) return
  const t = box.getBoundingClientRect()
  if (from && t.width) {
    const s = from.size / Math.max(t.width, t.height)
    zoom.value.firstStyle = {
      transform: `translate(${from.cx - (t.left + t.width / 2)}px, ${from.cy - (t.top + t.height / 2)}px) scale(${s})`,
      borderRadius: '50%'
    }
    // 等「起点样式」真正落到布局后再切到终点，过渡才会生效
    await nextTick()
    if (!zoom.value) return
    void box.offsetWidth
  }
  requestAnimationFrame(() => {
    if (zoom.value) zoom.value.phase = 'in'
  })
}

/** 点任意一处（含 ESC）-> 退出放大 */
function closeZoom() {
  if (!zoom.value || zoom.value.phase === 'out') return
  zoom.value.phase = 'out'
  zoomTimer = setTimeout(() => {
    zoom.value = null
  }, ZOOM_MS)
}

function openDetail(kind, data) {
  detail.value = { kind, data }
}

function closeDetail() {
  clearTimeout(zoomTimer)
  zoom.value = null
  detail.value = null
}

onUnmounted(() => {
  clearTimeout(zoomTimer)
})

function onKeydown(e) {
  if (e.key !== 'Escape') return
  if (zoom.value) closeZoom()
  else if (detail.value) closeDetail()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/* ---------------- 工具 ---------------- */
function statPct(key, value) {
  const max = STAT_MAX[key] || 1
  return Math.min(100, Math.round((value / max) * 100)) + '%'
}

/** 按装备名查装备对象（推荐装备、合成路径回显用） */
function findItem(name) {
  return items.value.find((it) => it.name === name)
}

function openItemByName(name) {
  const it = findItem(name)
  if (it) detail.value = { kind: 'item', data: it }
}

function openHeroByName(name) {
  const h = heroes.value.find((x) => x.name === name)
  if (h) detail.value = { kind: 'hero', data: h }
}

function openTraitByName(name) {
  const t = traits.value.find((x) => x.name === name)
  if (t) detail.value = { kind: 'trait', data: t }
}
</script>

<template>
  <div class="home">
    <!-- ===== 顶部召唤师信息条 ===== -->
    <header class="summoner">
      <div class="avatar">{{ avatarText(profile.nickName || profile.username) }}</div>

      <div class="who">
        <template v-if="loading">
          <h2 class="loading-text">正在进入战场…</h2>
        </template>
        <template v-else-if="error">
          <h2 class="err-text">{{ error }}</h2>
          <p class="sub">无法获取召唤师信息</p>
        </template>
        <template v-else>
          <h2>{{ profile.nickName || profile.username }}</h2>
          <p class="sub">@{{ profile.username }} · 入坑于 {{ formatDate(profile.createTime) }}</p>
        </template>
      </div>

      <div class="rank">
        <span class="rank-tier">荣耀黄金</span>
        <span class="rank-level">II</span>
      </div>

      <ul class="season">
        <li v-for="s in seasonStats" :key="s.label">
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </li>
      </ul>

      <div class="acts">
        <button class="btn-ghost" @click="goProfile">个人中心</button>
        <button v-if="isAdmin" class="btn-admin" @click="goAdmin">后台管理</button>
        <button class="btn-quit" @click="onLogout">退出登录</button>
      </div>
    </header>

    <!-- ===== Tab：英雄 / 装备 / 羁绊 ===== -->
    <nav class="tabs">
      <button :class="{ on: tab === 'hero' }" @click="tab = 'hero'">
        英雄图鉴 <i>{{ heroes.length }}</i>
      </button>
      <button :class="{ on: tab === 'item' }" @click="tab = 'item'">
        装备图鉴 <i>{{ items.length }}</i>
      </button>
      <button :class="{ on: tab === 'trait' }" @click="tab = 'trait'">
        羁绊图鉴 <i>{{ traits.length }}</i>
      </button>
    </nav>

    <!-- ===== 英雄 ===== -->
    <section v-if="tab === 'hero'" class="panel">
      <div class="filters">
        <input v-model="heroKw" class="search" type="search" placeholder="搜索英雄名 / 英文名" />
        <div class="chips">
          <button :class="{ on: heroCost === 'all' }" @click="heroCost = 'all'">全部费用</button>
          <button
            v-for="n in 5"
            :key="n"
            :class="{ on: heroCost === String(n) }"
            :style="{ '--c': COST_COLOR[n] }"
            @click="heroCost = String(n)"
          >
            {{ COST_LABEL[n] }}
          </button>
        </div>
        <select v-model="heroTrait" class="select">
          <option value="all">全部羁绊</option>
          <option v-for="t in traits" :key="t.name" :value="t.name">{{ t.name }}</option>
        </select>
      </div>

      <p class="count">共 <b>{{ heroList.length }}</b> 位英雄，点击卡片查看详细介绍</p>

      <div class="grid heroes">
        <button
          v-for="h in heroList"
          :key="h.name"
          class="card hero-card"
          :style="{ '--c': COST_COLOR[h.cost] }"
          @click="openDetail('hero', h)"
          @mouseenter="warmHero(h.name)"
        >
          <span class="cost-tag">{{ COST_LABEL[h.cost] }}</span>
          <span class="face" @click.stop="openZoom(h.name, $event)">
            <img v-if="heroAvatar(h.name)" :src="heroAvatar(h.name)" :alt="h.name" draggable="false" />
            <template v-else>{{ h.name.slice(0, 1) }}</template>
          </span>
          <h3>{{ h.name }}</h3>
          <p class="role">{{ h.role }}</p>
          <div class="tags">
            <span v-for="t in h.traits" :key="t">{{ t }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- ===== 装备 ===== -->
    <section v-if="tab === 'item'" class="panel">
      <div class="filters">
        <input v-model="itemKw" class="search" type="search" placeholder="搜索装备名" />
        <div class="chips">
          <button :class="{ on: itemKind === 'all' }" @click="itemKind = 'all'">全部</button>
          <button :class="{ on: itemKind === '基础' }" @click="itemKind = '基础'">基础散件</button>
          <button :class="{ on: itemKind === '合成' }" @click="itemKind = '合成'">合成装备</button>
        </div>
      </div>

      <p class="count">共 <b>{{ itemList.length }}</b> 件装备，点击卡片查看合成路径与详细介绍</p>

      <div class="grid items">
        <button
          v-for="it in itemList"
          :key="it.name"
          class="card item-card"
          @click="openDetail('item', it)"
        >
          <span class="kind-tag" :class="{ base: it.type === '基础' }">{{ it.type === '基础' ? '散件' : '合成' }}</span>
          <ItemIcon :name="it.name" :type="it.type" :recipe="it.recipe" :size="44" />
          <h3>{{ it.name }}</h3>
          <p class="stats-line">{{ it.stats }}</p>
        </button>
      </div>
    </section>

    <!-- ===== 羁绊 ===== -->
    <section v-if="tab === 'trait'" class="panel">
      <div class="filters">
        <input v-model="traitKw" class="search" type="search" placeholder="搜索羁绊名" />
        <div class="chips">
          <button :class="{ on: traitKind === 'all' }" @click="traitKind = 'all'">全部</button>
          <button :class="{ on: traitKind === '职业' }" @click="traitKind = '职业'">职业</button>
          <button :class="{ on: traitKind === '种族' }" @click="traitKind = '种族'">种族</button>
        </div>
      </div>

      <p class="count">共 <b>{{ traitList.length }}</b> 种羁绊，点击卡片查看各级效果</p>

      <div class="grid traits">
        <button
          v-for="t in traitList"
          :key="t.name"
          class="card trait-card"
          @click="openDetail('trait', t)"
        >
          <span class="kind-tag">{{ t.type }}</span>
          <TraitIcon :name="t.icon" :size="44" />
          <h3>{{ t.name }}</h3>
          <div class="tiers">
            <span v-for="(x, i) in t.tiers" :key="i">{{ x.count }} 人</span>
          </div>
          <p class="stats-line">{{ heroesOfTrait(t.name).length }} 位英雄拥有</p>
        </button>
      </div>
    </section>

    <p class="disclaimer">图鉴数据为演示用途整理，具体数值请以游戏内实际版本为准。</p>

    <!-- ===== 头像放大层：点任意头像放大到页面 1/2，再点任意处退出 ===== -->
    <div v-if="zoom" class="zoom-layer" :class="{ out: zoom.phase === 'out' }" @click="closeZoom">
      <figure
        ref="zoomBox"
        class="zoom-box"
        :class="{ prepare: zoom.phase === 'prepare' }"
        :style="zoom.phase === 'in' ? null : zoom.firstStyle"
      >
        <img :src="zoom.url" :alt="zoom.name" draggable="false" />
        <figcaption>{{ zoom.name }}</figcaption>
      </figure>
      <p class="zoom-tip">点击任意处关闭</p>
    </div>

    <!-- ===== 详情弹窗 ===== -->
    <div v-if="detail" class="mask" @click.self="closeDetail">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="close" @click="closeDetail" aria-label="关闭">×</button>

        <!-- ---- 英雄详情 ---- -->
        <template v-if="detail.kind === 'hero'">
          <div class="m-head" :style="{ '--c': COST_COLOR[detail.data.cost] }">
            <span class="m-face" @click.stop="openZoom(detail.data.name, $event)">
              <img v-if="heroAvatar(detail.data.name)" :src="heroAvatar(detail.data.name)" :alt="detail.data.name" draggable="false" />
              <template v-else>{{ detail.data.name.slice(0, 1) }}</template>
            </span>
            <div class="m-title">
              <h2>{{ detail.data.name }} <i>{{ detail.data.en }}</i></h2>
              <div class="m-meta">
                <span class="badge cost">{{ COST_LABEL[detail.data.cost] }}</span>
                <span class="badge">{{ detail.data.role }}</span>
                <span v-for="t in detail.data.traits" :key="t" class="badge trait" @click="openTraitByName(t)">{{ t }}</span>
              </div>
            </div>
          </div>
          <p class="tagline">「{{ detail.data.tagline }}」</p>

          <h4 class="sec">技能 · {{ detail.data.skill.name }}</h4>
          <p class="skill-desc">{{ detail.data.skill.desc }}</p>

          <h4 class="sec">属性</h4>
          <div class="stat-list">
            <div v-for="(v, k) in detail.data.stats" :key="k" class="stat">
              <span class="sl">{{ STAT_LABEL[k] }}</span>
              <div class="sbar"><i :style="{ width: statPct(k, v) }"></i></div>
              <span class="sv">{{ v }}</span>
            </div>
          </div>

          <h4 class="sec">推荐装备</h4>
          <div class="rec-items">
            <button v-for="nm in detail.data.items" :key="nm" class="rec-item" @click="openItemByName(nm)">
              <ItemIcon :name="nm" :type="findItem(nm)?.type || '基础'" :recipe="findItem(nm)?.recipe || []" :size="30" />
              <span>{{ nm }}</span>
            </button>
          </div>

          <h4 class="sec">玩法提示</h4>
          <p class="tip">{{ detail.data.tip }}</p>
        </template>

        <!-- ---- 装备详情 ---- -->
        <template v-else-if="detail.kind === 'item'">
          <div class="m-head">
            <span class="m-icon">
              <ItemIcon :name="detail.data.name" :type="detail.data.type" :recipe="detail.data.recipe" :size="52" />
            </span>
            <div class="m-title">
              <h2>{{ detail.data.name }}</h2>
              <div class="m-meta">
                <span class="badge">{{ detail.data.type === '基础' ? '基础散件' : '合成装备' }}</span>
              </div>
            </div>
          </div>

          <p class="stats-big">{{ detail.data.stats }}</p>

          <h4 class="sec">装备说明</h4>
          <p class="skill-desc">{{ detail.data.desc }}</p>

          <!-- 合成路径 -->
          <template v-if="detail.data.type === '合成'">
            <h4 class="sec">合成路径</h4>
            <div class="recipe">
              <button class="rec-piece" @click="openItemByName(detail.data.recipe[0])">
                <ItemIcon :name="detail.data.recipe[0]" type="基础" :size="40" />
                <span>{{ detail.data.recipe[0] }}</span>
              </button>
              <span class="op">+</span>
              <button class="rec-piece" @click="openItemByName(detail.data.recipe[1])">
                <ItemIcon :name="detail.data.recipe[1]" type="基础" :size="40" />
                <span>{{ detail.data.recipe[1] }}</span>
              </button>
              <span class="op">=</span>
              <div class="rec-piece result">
                <ItemIcon :name="detail.data.name" :type="detail.data.type" :recipe="detail.data.recipe" :size="40" />
                <span>{{ detail.data.name }}</span>
              </div>
            </div>
          </template>
          <!-- 散件：可合成列表 -->
          <template v-else>
            <h4 class="sec">可以合成</h4>
            <div class="into-list">
              <button
                v-for="nm in itemsFromBase(detail.data.name)"
                :key="nm"
                class="into-item"
                @click="openItemByName(nm)"
              >
                <ItemIcon :name="nm" type="合成" :recipe="findItem(nm)?.recipe || []" :size="26" />
                <span>{{ nm }}</span>
              </button>
              <p v-if="!itemsFromBase(detail.data.name).length" class="empty">暂无合成配方</p>
            </div>
          </template>

          <template v-if="detail.data.for">
            <h4 class="sec">适合英雄</h4>
            <div class="rec-heroes">
              <button v-for="nm in detail.data.for" :key="nm" class="hero-chip" @click="openHeroByName(nm)">
                {{ nm }}
              </button>
            </div>
          </template>
        </template>

        <!-- ---- 羁绊详情 ---- -->
        <template v-else>
          <div class="m-head">
            <span class="m-icon"><TraitIcon :name="detail.data.icon" :size="52" /></span>
            <div class="m-title">
              <h2>{{ detail.data.name }}</h2>
              <div class="m-meta">
                <span class="badge">{{ detail.data.type }}</span>
                <span class="badge">{{ heroesOfTrait(detail.data.name).length }} 位英雄</span>
              </div>
            </div>
          </div>

          <h4 class="sec">羁绊效果</h4>
          <ul class="tier-list">
            <li v-for="x in detail.data.tiers" :key="x.count">
              <span class="tier-n">{{ x.count }} 人</span>
              <span class="tier-d">{{ x.desc }}</span>
            </li>
          </ul>

          <h4 class="sec">拥有此羁绊的英雄</h4>
          <div class="rec-heroes">
            <button
              v-for="nm in heroesOfTrait(detail.data.name)"
              :key="nm"
              class="hero-chip"
              @click="openHeroByName(nm)"
            >
              {{ nm }}
            </button>
          </div>

          <h4 class="sec">搭配建议</h4>
          <p class="tip">{{ detail.data.tip }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============ 容器 ============ */
.home {
  width: min(1180px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 12px auto 40px;
  z-index: 2;
}

/* ============ 顶部召唤师条 ============ */
.summoner {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 16px 24px;
  border-radius: 18px;
  border: 1px solid rgba(247, 215, 116, 0.22);
  background: rgba(16, 19, 42, 0.78);
  backdrop-filter: blur(10px);
}

.avatar {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #3a2a06;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 60%, var(--gold-3));
  box-shadow: 0 6px 18px rgba(247, 215, 116, 0.32);
}

.who {
  min-width: 160px;
  flex: 1 1 200px;
}

.who h2 {
  font-size: 20px;
  letter-spacing: 1px;
  color: var(--gold-1);
}

.who .sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.loading-text,
.err-text {
  font-size: 16px !important;
}

.err-text {
  color: #ff8f8f;
}

.rank {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(224, 169, 59, 0.45);
  background: rgba(224, 169, 59, 0.12);
}

.rank-tier {
  font-size: 14px;
  font-weight: 700;
  color: var(--gold-1);
  letter-spacing: 1px;
}

.rank-level {
  font-size: 13px;
  color: var(--muted);
}

.season {
  display: flex;
  gap: 22px;
  list-style: none;
}

.season li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.season strong {
  font-size: 19px;
  color: var(--ink);
}

.season span {
  font-size: 11px;
  color: var(--muted);
}

.acts {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.btn-ghost,
.btn-admin,
.btn-quit {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost {
  color: var(--gold-1);
  background: transparent;
  border: 1px solid rgba(247, 215, 116, 0.45);
}

.btn-ghost:hover {
  border-color: var(--gold-1);
  background: rgba(247, 215, 116, 0.1);
}

/* 后台管理按钮：金色实心，区别于普通操作 */
.btn-admin {
  color: #3a2a06;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 55%, var(--gold-3));
  border: 1px solid transparent;
  box-shadow: 0 6px 18px rgba(247, 215, 116, 0.25);
}

.btn-admin:hover {
  filter: brightness(1.08);
  box-shadow: 0 8px 24px rgba(247, 215, 116, 0.4);
}

.btn-quit {
  color: #ffb4b4;
  background: transparent;
  border: 1px solid rgba(255, 120, 120, 0.38);
}

.btn-quit:hover {
  background: rgba(255, 120, 120, 0.12);
  border-color: #ff8f8f;
}

/* ============ Tab ============ */
.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 11px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  color: var(--muted);
  background: rgba(16, 19, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.tabs button i {
  font-style: normal;
  font-size: 12px;
  opacity: 0.7;
}

.tabs button:hover {
  color: var(--ink);
  border-color: rgba(247, 215, 116, 0.35);
}

.tabs button.on {
  color: #3a2a06;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 60%, var(--gold-3));
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(247, 215, 116, 0.3);
}

/* ============ 筛选区 ============ */
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search,
.select {
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--ink);
  background: rgba(16, 19, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.search {
  flex: 1 1 200px;
  max-width: 280px;
}

.search:focus,
.select:focus {
  border-color: var(--gold-2);
}

.select {
  cursor: pointer;
}

.select option {
  background: #161a3a;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chips button {
  padding: 8px 15px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  color: var(--muted);
  background: rgba(16, 19, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.chips button:hover {
  color: var(--ink);
}

.chips button.on {
  color: #12142c;
  font-weight: 700;
  background: var(--c, var(--gold-1));
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(247, 215, 116, 0.28);
}

.count {
  font-size: 12px;
  color: var(--muted);
}

.count b {
  color: var(--gold-1);
}

/* ============ 卡片网格 ============ */
.grid {
  display: grid;
  gap: 14px;
}

.grid.heroes {
  grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
}

.grid.items {
  grid-template-columns: repeat(auto-fill, minmax(178px, 1fr));
}

.grid.traits {
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 14px 18px;
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  color: var(--ink);
  background: linear-gradient(180deg, rgba(30, 34, 66, 0.86), rgba(16, 19, 42, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.09);
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
  font-family: inherit;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(247, 215, 116, 0.45);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42), 0 0 22px rgba(247, 215, 116, 0.1);
}

.card h3 {
  font-size: 15px;
  letter-spacing: 1px;
  color: var(--gold-1);
}

/* ---- 英雄卡 ---- */
.hero-card {
  border-color: color-mix(in srgb, var(--c) 30%, transparent);
}

.hero-card:hover {
  border-color: var(--c);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45), 0 0 26px color-mix(in srgb, var(--c) 30%, transparent);
}

.cost-tag {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  color: #12142c;
  background: var(--c);
}

.face {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.25), rgba(10, 12, 28, 0.9));
  border: 2px solid var(--c);
  box-shadow: 0 0 14px color-mix(in srgb, var(--c) 55%, transparent);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  cursor: zoom-in;
  transition: transform 0.18s, box-shadow 0.18s;
}

.face:hover {
  transform: scale(1.06);
  box-shadow: 0 0 20px color-mix(in srgb, var(--c) 75%, transparent);
}

.face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  user-select: none;
}

.role {
  font-size: 12px;
  color: var(--muted);
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.tags span {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.1);
  border: 1px solid rgba(247, 215, 116, 0.26);
}

/* ---- 装备卡 / 羁绊卡 ---- */
.kind-tag {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.12);
  border: 1px solid rgba(247, 215, 116, 0.3);
}

.kind-tag.base {
  color: var(--muted);
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.16);
}

.stats-line {
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

.tiers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.tiers span {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #6f6c8c;
  padding-top: 4px;
}

/* ============ 头像放大查看 ============ */
.zoom-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  cursor: pointer;
  background: rgba(6, 8, 20, 0.74);
  backdrop-filter: blur(6px);
  animation: zoom-fade 0.22s ease;
  transition: opacity 0.32s ease, backdrop-filter 0.32s ease;
}

.zoom-layer.out {
  opacity: 0;
  backdrop-filter: blur(0);
  pointer-events: none;
}

@keyframes zoom-fade {
  from { opacity: 0; }
}

/* 目标尺寸即「页面的一半」：宽 50vw，高度按原图比例自适应（不裁切、不拉伸） */
.zoom-box {
  position: relative;
  width: max(50vw, 260px);
  margin: 0;
  border-radius: 18px;
  overflow: hidden;
  background: #0b0d1e;
  border: 1px solid rgba(247, 215, 116, 0.45);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.62), 0 0 44px rgba(247, 215, 116, 0.12);
  transform-origin: center;
  transition:
    transform 0.38s cubic-bezier(0.22, 0.8, 0.24, 1),
    border-radius 0.38s ease;
  will-change: transform, border-radius;
}

/* 第一帧：贴在被点头像的位置，禁用过渡，保证动画有起点 */
.zoom-box.prepare {
  transition: none;
}

.zoom-box img {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

.zoom-box figcaption {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: max-content;
  max-width: 90%;
  padding: 22px 18px 14px;
  font-size: clamp(15px, 2.2vw, 22px);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.55) 60%, rgba(0, 0, 0, 0.8));
  border-radius: 14px 14px 0 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.78));
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
  opacity: 0;
  transition: opacity 0.3s ease 0.12s;
}

.zoom-layer:not(.out) .zoom-box figcaption {
  opacity: 1;
}

.zoom-tip {
  position: absolute;
  bottom: 26px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .zoom-box,
  .zoom-layer {
    transition: none;
  }
}

/* ============ 详情弹窗 ============ */
.mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(6, 8, 20, 0.72);
  backdrop-filter: blur(4px);
  animation: fade 0.18s ease;
}

@keyframes fade {
  from { opacity: 0; }
}

.modal {
  position: relative;
  width: min(620px, 100%);
  max-height: 86vh;
  overflow-y: auto;
  padding: 30px 32px 34px;
  border-radius: 20px;
  border: 1px solid rgba(247, 215, 116, 0.3);
  background: linear-gradient(180deg, rgba(32, 36, 70, 0.98), rgba(14, 17, 38, 0.99));
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  animation: pop 0.22s ease;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
}

.close {
  position: absolute;
  top: 16px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  transition: all 0.2s;
}

.close:hover {
  color: var(--ink);
  border-color: rgba(247, 215, 116, 0.5);
  background: rgba(247, 215, 116, 0.1);
}

.m-head {
  display: flex;
  align-items: center;
  gap: 18px;
}

.m-face {
  width: 66px;
  height: 66px;
  flex: 0 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 27px;
  font-weight: 700;
  color: #fff;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.25), rgba(10, 12, 28, 0.92));
  border: 2px solid var(--c, var(--gold-2));
  box-shadow: 0 0 18px color-mix(in srgb, var(--c, #e0a93b) 55%, transparent);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
  overflow: hidden;
  cursor: zoom-in;
  transition: transform 0.18s;
}

.m-face:hover {
  transform: scale(1.06);
}

.m-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  user-select: none;
}

.m-icon {
  width: 66px;
  height: 66px;
  flex: 0 0 auto;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(247, 215, 116, 0.28);
  background: rgba(247, 215, 116, 0.06);
}

.m-title h2 {
  font-size: 25px;
  letter-spacing: 2px;
  color: var(--gold-1);
}

.m-title h2 i {
  font-style: normal;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--muted);
  margin-left: 6px;
}

.m-meta {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 11px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.badge.cost {
  color: #12142c;
  font-weight: 700;
  background: var(--c, var(--gold-1));
  border-color: transparent;
}

.badge.trait {
  cursor: pointer;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.1);
  border-color: rgba(247, 215, 116, 0.3);
}

.badge.trait:hover {
  background: rgba(247, 215, 116, 0.2);
}

.tagline {
  margin-top: 18px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
  opacity: 0.85;
}

.sec {
  margin: 24px 0 10px;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--gold-1);
  padding-left: 10px;
  border-left: 3px solid var(--gold-2);
}

.skill-desc,
.tip {
  font-size: 13.5px;
  line-height: 1.95;
  color: var(--muted);
}

.stats-big {
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.08);
  border: 1px solid rgba(247, 215, 116, 0.22);
}

/* 属性条 */
.stat-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.stat {
  display: grid;
  grid-template-columns: 72px 1fr 54px;
  align-items: center;
  gap: 12px;
}

.sl {
  font-size: 12px;
  color: var(--muted);
}

.sbar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.sbar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--gold-3), var(--gold-1));
  box-shadow: 0 0 10px var(--gold-glow);
  animation: grow 0.5s ease;
}

@keyframes grow {
  from { width: 0 !important; }
}

.sv {
  font-size: 13px;
  text-align: right;
  color: var(--ink);
}

/* 推荐装备 */
.rec-items {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  font-family: inherit;
}

.rec-item:hover {
  border-color: rgba(247, 215, 116, 0.5);
  background: rgba(247, 215, 116, 0.1);
}

/* 合成路径 */
.recipe {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rec-piece {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  color: var(--ink);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s;
  font-family: inherit;
}

button.rec-piece:hover {
  border-color: rgba(247, 215, 116, 0.45);
  background: rgba(247, 215, 116, 0.1);
}

.rec-piece.result {
  cursor: default;
  color: var(--gold-1);
}

.op {
  font-size: 17px;
  color: var(--gold-2);
}

.into-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.into-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px 7px 9px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12.5px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  font-family: inherit;
}

.into-item:hover {
  border-color: rgba(247, 215, 116, 0.5);
  background: rgba(247, 215, 116, 0.1);
}

.empty {
  font-size: 13px;
  color: var(--muted);
}

/* 英雄 chips */
.rec-heroes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-chip {
  padding: 7px 15px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: var(--gold-1);
  background: rgba(247, 215, 116, 0.08);
  border: 1px solid rgba(247, 215, 116, 0.28);
  transition: all 0.2s;
  font-family: inherit;
}

.hero-chip:hover {
  background: rgba(247, 215, 116, 0.18);
  border-color: var(--gold-1);
}

/* 羁绊等级 */
.tier-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tier-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tier-n {
  flex: 0 0 auto;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #12142c;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
}

.tier-d {
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}

/* ============ 响应式 ============ */
@media (max-width: 860px) {
  .season {
    gap: 16px;
  }
  .acts {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 620px) {
  .summoner {
    gap: 14px;
    padding: 16px;
  }
  .grid.heroes {
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  }
  .grid.items,
  .grid.traits {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  .modal {
    padding: 26px 20px 28px;
  }
  .m-title h2 {
    font-size: 21px;
  }
  .stat {
    grid-template-columns: 64px 1fr 46px;
    gap: 8px;
  }
  .search {
    max-width: none;
  }
}
</style>
