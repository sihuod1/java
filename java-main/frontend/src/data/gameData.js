/* ============================================================
 * 金铲铲之战 · 自走棋游戏数据层
 * 参考《金铲铲之战》真实玩法，棋子/羁绊/装备为原创精简可玩版本
 * ============================================================ */

import { HEROES, ITEMS_BASE, ITEMS_MERGED } from './codex'
import { heroAvatar } from './heroAvatars'
import { itemPhoto } from './itemImages'

/* ---------- 羁绊 ----------
 * type: 'race'(种族) | 'job'(职业)
 * tiers: [{n: 激活人数, desc: 效果}]
 */
export const TRAITS = {
  /* --- 种族 --- */
  '山海': { type: 'race', icon: '山', tiers: [
    { n: 3, desc: '山海单位获得 300 护盾' },
    { n: 5, desc: '改为 600 护盾，且每秒回复 2% 生命' }
  ]},
  '妖庭': { type: 'race', icon: '妖', tiers: [
    { n: 2, desc: '妖庭单位普攻附带 8% 当前生命的魔法伤害' },
    { n: 4, desc: '改为 15% 当前生命的魔法伤害' }
  ]},
  '仙门': { type: 'race', icon: '仙', tiers: [
    { n: 2, desc: '仙门单位首次释放技能后，再释放一次 50% 威力' },
    { n: 4, desc: '第二次释放恢复为 100% 威力' }
  ]},
  '幽都': { type: 'race', icon: '幽', tiers: [
    { n: 2, desc: '幽都单位获得 15% 法术吸血' },
    { n: 4, desc: '改为 30% 法术吸血，且技能命中附加灼烧' }
  ]},
  '木灵': { type: 'race', icon: '木', tiers: [
    { n: 2, desc: '战斗开始时，全体友军每秒回复 1% 生命' },
    { n: 4, desc: '回复量提升至 2%，且木灵单位攻速 +15%' }
  ]},
  '器灵': { type: 'race', icon: '器', tiers: [
    { n: 2, desc: '器灵单位护甲魔抗 +25' },
    { n: 4, desc: '改为 +60，且首次受致命伤时保留 1 点生命（每局一次）' }
  ]},

  /* --- 职业 --- */
  '御剑': { type: 'job', icon: '剑', tiers: [
    { n: 2, desc: '御剑单位暴击率 +20%' },
    { n: 4, desc: '暴击率 +45%，暴击伤害 +40%' }
  ]},
  '符箓': { type: 'job', icon: '符', tiers: [
    { n: 2, desc: '符箓单位技能威力 +20%' },
    { n: 4, desc: '技能威力 +45%，且首次技能耗蓝 -20' }
  ]},
  '体修': { type: 'job', icon: '体', tiers: [
    { n: 2, desc: '体修单位生命上限 +20%' },
    { n: 4, desc: '生命上限 +40%，受击时 20% 格挡 40 伤害' }
  ]},
  '丹师': { type: 'job', icon: '丹', tiers: [
    { n: 2, desc: '全体友军每 5 秒回复 10% 已损生命' },
    { n: 4, desc: '回复提升至 18%，且丹师单位治疗 +30%' }
  ]},
  '驭兽': { type: 'job', icon: '兽', tiers: [
    { n: 2, desc: '战斗开始时召唤 1 只灵兽助战（继承驭兽单位 50% 属性）' },
    { n: 4, desc: '召唤 2 只，且灵兽属性提升至 70%' }
  ]},
  '影杀': { type: 'job', icon: '影', tiers: [
    { n: 2, desc: '影杀单位开局跳向后排，攻击附带 30 流血' },
    { n: 4, desc: '流血提升至 60，且击杀后刷新突进' }
  ]}
}

/* ---------- 棋子（数据源：codex 首页英雄，带英雄头像） ----------
 * 将首页图鉴英雄映射为自走棋棋子：
 * - id 用英文名去空格/撇号后小写（与 assets/heroes/*.png 文件名一致）
 * - stats 从 codex 的 {hp, ad, armor, mr, as, mana} 补全战斗所需字段
 * - traits 按 role 映射到本文件 TRAITS 中的职业羁绊
 * - avatar 取 heroAvatar（本地头像图） */
function roleToTrait(role) {
  const r = role || ''
  if (r.includes('坦克') || r.includes('保护') || r.includes('控制')) return '体修'
  if (r.includes('辅助') || r.includes('增益')) return '丹师'
  if (r.includes('刺客') || r.includes('切入') || r.includes('收割')) return '影杀'
  if (r.includes('法术')) return '符箓'
  return '御剑'
}

function roleToRange(role) {
  const r = role || ''
  if (r.includes('远程') || r.includes('炮台') || r.includes('法术') || r.includes('辅助') || r.includes('增益')) return 3
  if (r.includes('控制')) return 2
  return 1
}

function buildChamp(h) {
  const s = h.stats || {}
  return {
    id: (h.en || h.name).toLowerCase().replace(/[^a-z]/g, ''),
    name: h.name,
    en: h.en || '',
    cost: h.cost,
    traits: [roleToTrait(h.role)],
    role: h.role || '',
    tagline: h.tagline || '',
    stats: {
      hp: s.hp || 600,
      atk: s.ad || 50,
      atkSpeed: s.as || 0.65,
      armor: s.armor || 25,
      mr: s.mr || 25,
      mana: 0,
      manaMax: s.mana || 60,
      range: roleToRange(h.role)
    },
    skill: h.skill || { name: '', desc: '' },
    avatar: heroAvatar(h.name)
  }
}

export const CHAMPIONS = HEROES.map(buildChamp)


/* ---------- 散件装备（数据源：首页 codex 的 ITEMS_BASE，带图片） ---------- */
export const BASE_ITEMS = ITEMS_BASE.map(it => ({
  id: it.name,
  name: it.name,
  stat: it.stats,
  desc: it.desc || '',
  img: itemPhoto(it.name) || null
}))

/* ---------- 成品装备（数据源：首页 codex 的 ITEMS_MERGED，带图片） ----------
 * a/b 为两个散件的名称（recipe），与 BASE_ITEMS 的 name 对应 */
export const FULL_ITEMS = ITEMS_MERGED.map(it => ({
  id: it.name,
  name: it.name,
  a: it.recipe[0],
  b: it.recipe[1],
  stat: it.stats,
  desc: it.desc || '',
  img: itemPhoto(it.name) || null
}))

/* ---------- 强化符文（海克斯） ----------
 * tier: 1银 2金 3彩
 * type: 经济/战斗/羁绊
 */
export const RUNES = [
  { id: 'cunxin', name: '存心失利', tier: 1, type: '经济', desc: '战败时额外获得 2 金币' },
  { id: 'jubao', name: '聚宝灵田', tier: 1, type: '经济', desc: '每回合额外获得 1 金币' },
  { id: 'duichong', name: '对冲基金', tier: 2, type: '经济', desc: '利息上限提升至 60，金币上限 60' },
  { id: 'dianshi', name: '点石成金', tier: 2, type: '经济', desc: '出售棋子返还 100% 金币' },
  { id: 'caideng', name: '棱彩门票', tier: 3, type: '经济', desc: '每次刷新商店返还 1 金币' },
  { id: 'xingjie', name: '星界赐福', tier: 2, type: '战斗', desc: '全体友军每秒回复 1.5% 生命' },
  { id: 'titan', name: '泰坦之力', tier: 1, type: '战斗', desc: '前排单位生命 +150' },
  { id: 'lianxin', name: '连心铁链', tier: 2, type: '战斗', desc: '战斗开始时，全体友军共享 15% 生命上限护盾' },
  { id: 'fenkuang', name: '疯狂药剂', tier: 3, type: '战斗', desc: '全体友军攻速 +30%，但每秒损失 1% 生命' },
  { id: 'wanneng', name: '万灵共鸣', tier: 2, type: '羁绊', desc: '场上每有一种激活羁绊，全体友军法强 +8' },
  { id: 'jianzhi', name: '剑指九霄', tier: 3, type: '羁绊', desc: '御剑羁绊额外 +1 层效果' },
  { id: 'shouwang', name: '兽王之威', tier: 3, type: '羁绊', desc: '驭兽召唤的灵兽属性提升至 100%' }
]

/* ---------- 商店刷新概率（按人口） ----------
 * 索引 = 人口数（1-9），值为 [1费,2费,3费,4费,5费] 百分比
 */
export const SHOP_ODDS = {
  1: [100, 0, 0, 0, 0],
  2: [100, 0, 0, 0, 0],
  3: [75, 25, 0, 0, 0],
  4: [55, 30, 15, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [30, 40, 25, 5, 0],
  7: [19, 30, 35, 15, 1],
  8: [16, 20, 35, 25, 4],
  9: [9, 15, 30, 30, 16]
}

/* ---------- 升级人口所需经验/金币 ---------- */
export const LEVEL_UP_COST = {
  2: 0, 3: 2, 4: 6, 5: 10, 6: 20, 7: 36, 8: 48, 9: 76
}

/* ---------- 每费棋子在卡池中的总数量（用于卡池共享） ---------- */
export const POOL_COUNT = { 1: 29, 2: 22, 3: 18, 4: 12, 5: 10 }

/* ---------- 利息计算 ---------- */
export function interestOf(gold) {
  return Math.min(5, Math.floor(gold / 10))
}

/* ---------- 星级系数 ---------- */
export const STAR_MULT = { 1: 1, 2: 1.8, 3: 3.24 }

/* ---------- 费用颜色 ---------- */
export const COST_COLOR = { 1: '#9aa4af', 2: '#2ecc71', 3: '#4a90d9', 4: '#c99ae0', 5: '#f0b429' }
export const COST_LABEL = { 1: '1费', 2: '2费', 3: '3费', 4: '4费', 5: '5费' }
