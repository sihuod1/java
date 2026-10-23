<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminApi,
  clearAdminLogin,
  getSavedAdmin,
  isAdminLoggedIn
} from '../utils/adminAuth'

const router = useRouter()

/* ---------------- 全局状态 ---------------- */
const tab = ref('hero') // hero | item | trait
const loading = ref(false)
const toast = ref(null) // { type: 'ok'|'err', text }
let toastTimer = null

function notify(type, text) {
  toast.value = { type, text }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2600)
}

/* ---------------- 列表数据 ---------------- */
const heroes = ref([])
const items = ref([])
const traits = ref([])

const admin = getSavedAdmin()

async function loadAll() {
  loading.value = true
  try {
    const [h, i, t] = await Promise.all([
      adminApi('/api/admin/heroes'),
      adminApi('/api/admin/items'),
      adminApi('/api/admin/traits')
    ])
    heroes.value = h
    items.value = i
    traits.value = t
  } catch (e) {
    notify('err', e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isAdminLoggedIn()) {
    router.replace({ name: 'adminLogin' })
    return
  }
  loadAll()
})

/* ---------------- JSON 字段工具 ---------------- */
/** 安全 parse JSON 字符串，失败返回 null */
function tryParse(s) {
  if (!s || !s.trim()) return null
  try {
    return JSON.parse(s)
  } catch (e) {
    return undefined // undefined = 格式错误
  }
}

/** 后端返回的 JSON 字符串 -> 逗号分隔文本（数组用） */
function jsonToText(s) {
  const v = tryParse(s)
  return Array.isArray(v) ? v.join('，') : ''
}

/** 后端返回的 JSON 字符串 -> 格式化文本（对象用） */
function jsonToPretty(s) {
  const v = tryParse(s)
  return v == null ? '' : JSON.stringify(v, null, 2)
}

/** 逗号分隔文本（支持中英文逗号） -> JSON 字符串 */
function textToJsonArray(s) {
  if (!s || !s.trim()) return JSON.stringify([])
  return JSON.stringify(s.split(/[,，]/).map((x) => x.trim()).filter(Boolean))
}

/* ---------------- 编辑弹窗 ---------------- */
// 当前编辑中的分类与表单
const editing = ref(null) // 'hero' | 'item' | 'trait' | null
const editingId = ref(null) // null = 新增
const heroForm = ref({})
const itemForm = ref({})
const traitForm = ref({})
const saving = ref(false)

function openCreate(kind) {
  editingId.value = null
  if (kind === 'hero') {
    heroForm.value = {
      name: '', en: '', cost: 1, traitsText: '', role: '', tagline: '',
      skillName: '', skillDesc: '', itemsText: '', statsText: '', tip: '', sort: nextSort(heroes)
    }
  } else if (kind === 'item') {
    itemForm.value = {
      name: '', type: '合成', recipeText: '', stats: '', desc: '', forText: '', sort: nextSort(items)
    }
  } else {
    traitForm.value = {
      name: '', type: '职业', icon: '', tiersText: '', tip: '', sort: nextSort(traits)
    }
  }
  editing.value = kind
}

function openEdit(kind, row) {
  editingId.value = row.id
  if (kind === 'hero') {
    heroForm.value = {
      name: row.name, en: row.en || '', cost: row.cost,
      traitsText: jsonToText(row.traits), role: row.role || '', tagline: row.tagline || '',
      skillName: row.skillName || '', skillDesc: row.skillDesc || '',
      itemsText: jsonToText(row.items), statsText: jsonToPretty(row.stats),
      tip: row.tip || '', sort: row.sort ?? 0
    }
  } else if (kind === 'item') {
    itemForm.value = {
      name: row.name, type: row.type, recipeText: jsonToText(row.recipe),
      stats: row.stats || '', desc: row.desc || '', forText: jsonToText(row.forHeroes),
      sort: row.sort ?? 0
    }
  } else {
    traitForm.value = {
      name: row.name, type: row.type, icon: row.icon || '',
      tiersText: jsonToPretty(row.tiers), tip: row.tip || '', sort: row.sort ?? 0
    }
  }
  editing.value = kind
}

function closeEdit() {
  editing.value = null
  editingId.value = null
}

function nextSort(list) {
  return list.value.reduce((m, x) => Math.max(m, x.sort || 0), 0) + 1
}

async function saveHero() {
  const f = heroForm.value
  if (!f.name.trim()) return notify('err', '英雄名不能为空')
  const stats = tryParse(f.statsText)
  if (stats === undefined) return notify('err', '属性 stats 不是合法 JSON')
  saving.value = true
  try {
    const body = {
      name: f.name.trim(), en: (f.en || '').trim(), cost: Number(f.cost),
      traits: textToJsonArray(f.traitsText), role: f.role, tagline: f.tagline,
      skillName: f.skillName, skillDesc: f.skillDesc,
      items: textToJsonArray(f.itemsText),
      stats: stats == null ? null : JSON.stringify(stats),
      tip: f.tip, sort: Number(f.sort) || 0
    }
    if (editingId.value) {
      await adminApi(`/api/admin/heroes/${editingId.value}`, { method: 'PUT', body })
      notify('ok', `英雄「${f.name}」已更新`)
    } else {
      await adminApi('/api/admin/heroes', { method: 'POST', body })
      notify('ok', `英雄「${f.name}」已添加`)
    }
    closeEdit()
    heroes.value = await adminApi('/api/admin/heroes')
  } catch (e) {
    notify('err', e.message)
  } finally {
    saving.value = false
  }
}

async function saveItem() {
  const f = itemForm.value
  if (!f.name.trim()) return notify('err', '装备名不能为空')
  saving.value = true
  try {
    const body = {
      name: f.name.trim(), type: f.type,
      recipe: f.type === '合成' ? textToJsonArray(f.recipeText) : null,
      stats: f.stats, desc: f.desc,
      forHeroes: textToJsonArray(f.forText),
      sort: Number(f.sort) || 0
    }
    if (editingId.value) {
      await adminApi(`/api/admin/items/${editingId.value}`, { method: 'PUT', body })
      notify('ok', `装备「${f.name}」已更新`)
    } else {
      await adminApi('/api/admin/items', { method: 'POST', body })
      notify('ok', `装备「${f.name}」已添加`)
    }
    closeEdit()
    items.value = await adminApi('/api/admin/items')
  } catch (e) {
    notify('err', e.message)
  } finally {
    saving.value = false
  }
}

async function saveTrait() {
  const f = traitForm.value
  if (!f.name.trim()) return notify('err', '羁绊名不能为空')
  const tiers = tryParse(f.tiersText)
  if (tiers === undefined) return notify('err', '等级效果 tiers 不是合法 JSON（应为 [{count, desc}] 数组）')
  saving.value = true
  try {
    const body = {
      name: f.name.trim(), type: f.type, icon: f.icon,
      tiers: tiers == null ? null : JSON.stringify(tiers),
      tip: f.tip, sort: Number(f.sort) || 0
    }
    if (editingId.value) {
      await adminApi(`/api/admin/traits/${editingId.value}`, { method: 'PUT', body })
      notify('ok', `羁绊「${f.name}」已更新`)
    } else {
      await adminApi('/api/admin/traits', { method: 'POST', body })
      notify('ok', `羁绊「${f.name}」已添加`)
    }
    closeEdit()
    traits.value = await adminApi('/api/admin/traits')
  } catch (e) {
    notify('err', e.message)
  } finally {
    saving.value = false
  }
}

/* ---------------- 删除 ---------------- */
const confirmRow = ref(null) // { kind, row } 待二次确认

function askDelete(kind, row) {
  confirmRow.value = { kind, row }
}

async function doDelete() {
  const { kind, row } = confirmRow.value || {}
  if (!kind) return
  try {
    await adminApi(`/api/admin/${kind === 'hero' ? 'heroes' : kind === 'item' ? 'items' : 'traits'}/${row.id}`, {
      method: 'DELETE'
    })
    notify('ok', `「${row.name}」已删除，首页同步更新`)
    confirmRow.value = null
    await loadAll()
  } catch (e) {
    notify('err', e.message)
    confirmRow.value = null
  }
}

/* ---------------- 退出登录 ---------------- */
async function onLogout() {
  try {
    await adminApi('/api/admin/logout', { method: 'POST' })
  } catch (e) {
    /* 忽略退出时的网络错误 */
  }
  clearAdminLogin()
  router.replace({ name: 'adminLogin' })
}

/* ---------------- 展示辅助 ---------------- */
const COST_LABEL = { 1: '一费', 2: '二费', 3: '三费', 4: '四费', 5: '五费' }
const COST_COLOR = { 1: '#8f9bb3', 2: '#2fae5f', 3: '#3b8bf5', 4: '#b45cf0', 5: '#f5b942' }

function traitNames(row) {
  return jsonToText(row.traits).replace(/，/g, ' / ')
}

function recipeNames(row) {
  return jsonToText(row.recipe).replace(/，/g, ' + ') || '—'
}

function tierCount(row) {
  const v = tryParse(row.tiers)
  return Array.isArray(v) ? v.length : 0
}

const curListLen = computed(() =>
  tab.value === 'hero' ? heroes.value.length : tab.value === 'item' ? items.value.length : traits.value.length
)
</script>

<template>
  <div class="admin">
    <!-- ===== 顶栏 ===== -->
    <header class="admin-top">
      <div class="brand">
        <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
          <path d="M32 6l20 7v16c0 13.5-8.5 24.5-20 29-11.5-4.5-20-15.5-20-29V13l20-7z" stroke="#f7d774" stroke-width="4" fill="rgba(247,215,116,0.12)" />
        </svg>
        <b>金铲铲 · 后台管理系统</b>
      </div>
      <div class="admin-acts">
        <span class="who">👤 {{ admin.nickName || admin.username || '管理员' }}</span>
        <a href="#/" class="link">返回首页</a>
        <button class="ghost" @click="onLogout">退出登录</button>
      </div>
    </header>

    <!-- ===== Tab 切换 ===== -->
    <nav class="admin-tabs">
      <button :class="{ on: tab === 'hero' }" @click="tab = 'hero'">
        英雄管理 <i>{{ heroes.length }}</i>
      </button>
      <button :class="{ on: tab === 'item' }" @click="tab = 'item'">
        装备管理 <i>{{ items.length }}</i>
      </button>
      <button :class="{ on: tab === 'trait' }" @click="tab = 'trait'">
        羁绊管理 <i>{{ traits.length }}</i>
      </button>
    </nav>

    <!-- ===== 工具条 ===== -->
    <div class="toolbar">
      <p class="tip">这里的增删改会实时同步到首页图鉴展示。</p>
      <button class="primary" @click="openCreate(tab)">
        ＋ 新增{{ tab === 'hero' ? '英雄' : tab === 'item' ? '装备' : '羁绊' }}
      </button>
    </div>

    <!-- ===== 英雄表 ===== -->
    <div v-if="tab === 'hero'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 150px">英雄</th>
            <th style="width: 70px">费用</th>
            <th style="width: 140px">羁绊</th>
            <th style="width: 100px">定位</th>
            <th>技能</th>
            <th style="width: 60px">排序</th>
            <th style="width: 130px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in heroes" :key="h.id">
            <td>
              <b class="gold">{{ h.name }}</b>
              <span class="en">{{ h.en }}</span>
            </td>
            <td>
              <span class="cost" :style="{ background: COST_COLOR[h.cost] }">{{ COST_LABEL[h.cost] || h.cost }}</span>
            </td>
            <td>{{ traitNames(h) || '—' }}</td>
            <td>{{ h.role || '—' }}</td>
            <td class="ellip">{{ h.skillName }}：{{ h.skillDesc }}</td>
            <td>{{ h.sort }}</td>
            <td>
              <button class="opt" @click="openEdit('hero', h)">编辑</button>
              <button class="opt danger" @click="askDelete('hero', h)">删除</button>
            </td>
          </tr>
          <tr v-if="!heroes.length && !loading">
            <td colspan="7" class="empty">暂无英雄数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 装备表 ===== -->
    <div v-if="tab === 'item'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 150px">装备</th>
            <th style="width: 70px">类型</th>
            <th style="width: 170px">配方</th>
            <th style="width: 190px">属性</th>
            <th>说明</th>
            <th style="width: 60px">排序</th>
            <th style="width: 130px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in items" :key="it.id">
            <td><b class="gold">{{ it.name }}</b></td>
            <td>
              <span class="kind" :class="{ base: it.type === '基础' }">{{ it.type === '基础' ? '散件' : '合成' }}</span>
            </td>
            <td>{{ recipeNames(it) }}</td>
            <td>{{ it.stats || '—' }}</td>
            <td class="ellip">{{ it.desc }}</td>
            <td>{{ it.sort }}</td>
            <td>
              <button class="opt" @click="openEdit('item', it)">编辑</button>
              <button class="opt danger" @click="askDelete('item', it)">删除</button>
            </td>
          </tr>
          <tr v-if="!items.length && !loading">
            <td colspan="7" class="empty">暂无装备数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 羁绊表 ===== -->
    <div v-if="tab === 'trait'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 150px">羁绊</th>
            <th style="width: 80px">类型</th>
            <th style="width: 90px">图标</th>
            <th style="width: 90px">档位数</th>
            <th>心得</th>
            <th style="width: 60px">排序</th>
            <th style="width: 130px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in traits" :key="t.id">
            <td><b class="gold">{{ t.name }}</b></td>
            <td>{{ t.type }}</td>
            <td>{{ t.icon || '—' }}</td>
            <td>{{ tierCount(t) }} 档</td>
            <td class="ellip">{{ t.tip }}</td>
            <td>{{ t.sort }}</td>
            <td>
              <button class="opt" @click="openEdit('trait', t)">编辑</button>
              <button class="opt danger" @click="askDelete('trait', t)">删除</button>
            </td>
          </tr>
          <tr v-if="!traits.length && !loading">
            <td colspan="7" class="empty">暂无羁绊数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="loading" class="loading">加载中…</p>
    <p class="foot-note">数据变更后，刷新首页（/home）即可看到最新图鉴内容。</p>

    <!-- ===== 编辑弹窗 ===== -->
    <div v-if="editing" class="mask" @click.self="closeEdit">
      <div class="modal">
        <h2>
          {{ editingId ? '编辑' : '新增' }}{{ editing === 'hero' ? '英雄' : editing === 'item' ? '装备' : '羁绊' }}
          <button class="x" @click="closeEdit">✕</button>
        </h2>

        <!-- 英雄表单 -->
        <form v-if="editing === 'hero'" class="form" @submit.prevent="saveHero">
          <div class="row2">
            <label>英雄名 *<input v-model="heroForm.name" placeholder="如：盖伦" /></label>
            <label>英文名<input v-model="heroForm.en" placeholder="如：Garen（用于匹配本地头像）" /></label>
          </div>
          <div class="row2">
            <label>费用 *
              <select v-model="heroForm.cost">
                <option :value="1">一费</option>
                <option :value="2">二费</option>
                <option :value="3">三费</option>
                <option :value="4">四费</option>
                <option :value="5">五费</option>
              </select>
            </label>
            <label>排序<input v-model.number="heroForm.sort" type="number" /></label>
          </div>
          <div class="row2">
            <label>羁绊（逗号分隔）<input v-model="heroForm.traitsText" placeholder="如：骑士，战士" /></label>
            <label>定位<input v-model="heroForm.role" placeholder="如：前排坦克" /></label>
          </div>
          <label>台词<input v-model="heroForm.tagline" /></label>
          <div class="row2">
            <label>技能名<input v-model="heroForm.skillName" /></label>
            <label>推荐装备（逗号分隔）<input v-model="heroForm.itemsText" /></label>
          </div>
          <label>技能描述<textarea v-model="heroForm.skillDesc" rows="2" /></label>
          <label>使用心得<textarea v-model="heroForm.tip" rows="2" /></label>
          <label>属性 JSON（{hp, ad, armor, mr, as, mana}）
            <textarea v-model="heroForm.statsText" rows="4" spellcheck="false" placeholder='{"hp":700,"ad":55,"armor":35,"mr":25,"as":0.6,"mana":60}' />
          </label>
          <p class="hint">提示：新增英雄若英文名没有对应本地头像，卡片会自动显示名字首字。</p>
          <button class="primary big" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保 存' }}</button>
        </form>

        <!-- 装备表单 -->
        <form v-if="editing === 'item'" class="form" @submit.prevent="saveItem">
          <div class="row2">
            <label>装备名 *<input v-model="itemForm.name" /></label>
            <label>类型 *
              <select v-model="itemForm.type">
                <option value="基础">基础（散件）</option>
                <option value="合成">合成装备</option>
              </select>
            </label>
          </div>
          <div class="row2">
            <label>属性<input v-model="itemForm.stats" placeholder="如：+30 攻击力" /></label>
            <label>排序<input v-model.number="itemForm.sort" type="number" /></label>
          </div>
          <label v-if="itemForm.type === '合成'">合成配方（逗号分隔）<input v-model="itemForm.recipeText" placeholder="如：暴风大剑，暴风大剑" /></label>
          <label>适用英雄（逗号分隔）<input v-model="itemForm.forText" /></label>
          <label>装备说明<textarea v-model="itemForm.desc" rows="3" /></label>
          <button class="primary big" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保 存' }}</button>
        </form>

        <!-- 羁绊表单 -->
        <form v-if="editing === 'trait'" class="form" @submit.prevent="saveTrait">
          <div class="row2">
            <label>羁绊名 *<input v-model="traitForm.name" /></label>
            <label>类型 *
              <select v-model="traitForm.type">
                <option value="职业">职业</option>
                <option value="种族">种族</option>
              </select>
            </label>
          </div>
          <div class="row2">
            <label>图标标识<input v-model="traitForm.icon" placeholder="如：shield / bow / sword" /></label>
            <label>排序<input v-model.number="traitForm.sort" type="number" /></label>
          </div>
          <label>等级效果 JSON（[{count, desc}]）
            <textarea v-model="traitForm.tiersText" rows="5" spellcheck="false" placeholder='[{"count":2,"desc":"所有骑士获得 15% 伤害减免"}]' />
          </label>
          <label>使用心得<textarea v-model="traitForm.tip" rows="2" /></label>
          <button class="primary big" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保 存' }}</button>
        </form>
      </div>
    </div>

    <!-- ===== 删除确认 ===== -->
    <div v-if="confirmRow" class="mask" @click.self="confirmRow = null">
      <div class="modal mini">
        <h2>确认删除</h2>
        <p>
          确定删除「<b class="gold">{{ confirmRow.row.name }}</b>」吗？
          删除后首页图鉴将不再展示该内容，且不可恢复。
        </p>
        <div class="btns">
          <button class="ghost" @click="confirmRow = null">取消</button>
          <button class="primary" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- ===== 轻提示 ===== -->
    <div v-if="toast" class="toast" :class="toast.type">{{ toast.text }}</div>
  </div>
</template>

<style scoped>
/* ===== 整体 ===== */
.admin {
  width: min(1240px, 94vw);
  margin: 0 auto;
  padding: 26px 0 60px;
}

/* ===== 顶栏 ===== */
.admin-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(30, 34, 66, 0.9), rgba(16, 19, 42, 0.94));
  border: 1px solid rgba(247, 215, 116, 0.22);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  letter-spacing: 1px;
  color: var(--gold-1);
}

.admin-acts {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
}

.who {
  color: var(--muted);
}

.link {
  color: var(--gold-1);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* ===== 按钮 ===== */
.primary {
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 1px;
  color: #3a2a06;
  cursor: pointer;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 55%, var(--gold-3));
  box-shadow: 0 6px 18px rgba(247, 215, 116, 0.28);
}

.primary:hover {
  filter: brightness(1.06);
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary.big {
  width: 100%;
  padding: 13px;
  font-size: 15px;
  margin-top: 6px;
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-family: inherit;
  color: var(--ink);
  cursor: pointer;
  background: rgba(16, 19, 42, 0.6);
}

.ghost:hover {
  border-color: rgba(247, 215, 116, 0.4);
}

/* ===== Tab ===== */
.admin-tabs {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.admin-tabs button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-family: inherit;
  color: var(--muted);
  background: rgba(16, 19, 42, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.admin-tabs button i {
  font-style: normal;
  opacity: 0.75;
  margin-left: 4px;
  font-size: 12px;
}

.admin-tabs button.on {
  color: #3a2a06;
  font-weight: 700;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2) 60%, var(--gold-3));
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(247, 215, 116, 0.3);
}

/* ===== 工具条 ===== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 2px 10px;
}

.toolbar .tip {
  font-size: 12px;
  color: var(--muted);
}

/* ===== 表格 ===== */
.table-wrap {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(16, 19, 42, 0.72);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  padding: 11px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

th {
  color: var(--gold-1);
  font-size: 12px;
  letter-spacing: 1px;
  white-space: nowrap;
  background: rgba(247, 215, 116, 0.05);
}

td {
  color: var(--ink);
  vertical-align: top;
}

tbody tr:hover {
  background: rgba(247, 215, 116, 0.04);
}

tbody tr:last-child td {
  border-bottom: none;
}

.gold {
  color: var(--gold-1);
  font-size: 14px;
}

.en {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

.ellip {
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--muted);
}

.cost {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #12142c;
  white-space: nowrap;
}

.kind {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #12142c;
  background: var(--gold-1);
  white-space: nowrap;
}

.kind.base {
  background: #8f9bb3;
}

.opt {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-family: inherit;
  color: var(--ink);
  cursor: pointer;
  background: transparent;
  margin-right: 6px;
}

.opt:hover {
  border-color: var(--gold-1);
  color: var(--gold-1);
}

.opt.danger:hover {
  border-color: #ff7a6b;
  color: #ff9a8b;
}

.empty {
  text-align: center;
  color: var(--muted);
  padding: 30px 0 !important;
}

.loading,
.foot-note {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  margin-top: 14px;
}

/* ===== 弹窗 ===== */
.mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(6, 8, 20, 0.72);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(720px, 94vw);
  max-height: 86vh;
  overflow-y: auto;
  border-radius: 18px;
  padding: 26px 30px 30px;
  background: linear-gradient(180deg, #232750, #14163a 70%);
  border: 1px solid rgba(247, 215, 116, 0.28);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.modal.mini {
  width: min(420px, 92vw);
  text-align: center;
}

.modal h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--gold-1);
  margin-bottom: 18px;
}

.modal .x {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 15px;
  cursor: pointer;
}

.modal .x:hover {
  color: #fff;
}

.modal p {
  font-size: 13px;
  color: var(--ink);
  line-height: 1.8;
}

.btns {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 22px;
}

/* ===== 表单 ===== */
.form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 14px;
}

.form .row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form input,
.form select,
.form textarea {
  border-radius: 10px;
  border: 1px solid rgba(247, 215, 116, 0.2);
  background: rgba(8, 11, 28, 0.6);
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  padding: 10px 12px;
  outline: none;
}

.form textarea {
  resize: vertical;
  font-family: Consolas, monospace;
  line-height: 1.6;
}

.form input:focus,
.form select:focus,
.form textarea:focus {
  border-color: var(--gold-1);
  box-shadow: 0 0 0 3px rgba(247, 215, 116, 0.14);
}

.form .hint {
  font-size: 11px;
  color: var(--muted);
  margin: -6px 0 12px;
}

/* ===== 轻提示 ===== */
.toast {
  position: fixed;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  padding: 11px 22px;
  border-radius: 12px;
  font-size: 13px;
  color: #12142c;
  background: linear-gradient(180deg, var(--gold-1), var(--gold-2));
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.toast.err {
  color: #fff;
  background: linear-gradient(180deg, #e5645c, #c03b33);
}

@media (max-width: 760px) {
  .admin-top {
    flex-wrap: wrap;
  }

  .form .row2 {
    grid-template-columns: 1fr;
  }
}
</style>
