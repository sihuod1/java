/* ============================================================
 * 自走棋游戏核心逻辑（纯函数，无 DOM 依赖）
 * ============================================================ */
import {
  CHAMPIONS, TRAITS, BASE_ITEMS, FULL_ITEMS, RUNES,
  SHOP_ODDS, LEVEL_UP_COST, POOL_COUNT, interestOf, STAR_MULT
} from './gameData'

/* ---------- 工具 ---------- */
function rand(n) { return Math.floor(Math.random() * n) }
function pick(arr) { return arr[rand(arr.length)] }

/* 按费用概率生成一次商店（5 格） */
function rollShop(level) {
  const odds = SHOP_ODDS[level] || SHOP_ODDS[9]
  const shop = []
  for (let i = 0; i < 5; i++) {
    shop.push(rollOne(odds))
  }
  return shop
}

function rollOne(odds) {
  const r = Math.random() * 100
  let acc = 0
  for (let c = 1; c <= 5; c++) {
    acc += odds[c - 1]
    if (r < acc) return c
  }
  return 1
}

/* 按费用随机取一个棋子 */
function randomChampByCost(cost) {
  const pool = CHAMPIONS.filter(c => c.cost === cost)
  return pool[rand(pool.length)]
}

/* 生成一个初始玩家状态 */
export function createPlayer(isAI = false, name = '召唤师') {
  return {
    name,
    isAI,
    hp: 100,
    gold: isAI ? 10 : 10,
    level: isAI ? 3 : 1,
    xp: 0,               // 当前经验（升级用）
    board: [],           // 上阵单位 [{champ, star, items}]
    bench: [],           // 备战席单位
    shop: [],            // 商店 5 格
    pool: {},            // 已持有的棋子计数（按 cost 记录，用于卡池）——简化：不严格扣卡池
    winStreak: 0,
    loseStreak: 0,
    lastFight: null,     // 上回合战斗结果 'win'|'lose'
    runes: [],           // 已选符文
    baseItems: [],       // 散件库存 [{id}]
    alive: true
  }
}

/* 单位 = 棋子上阵后的实例 */
function makeUnit(champId, star, items) {
  const c = CHAMPIONS.find(x => x.id === champId)
  return { champ: c, star, items: items || [], stats: null }
}

/* 计算单位战斗属性（含星级、装备、羁绊加成） */
function computeStats(unit, traitBonuses) {
  const c = unit.champ
  const m = STAR_MULT[unit.star] || 1
  const s = {
    hp: Math.round(c.stats.hp * m),
    atk: Math.round(c.stats.atk * m),
    atkSpeed: c.stats.atkSpeed,
    armor: c.stats.armor,
    mr: c.stats.mr,
    mana: c.stats.mana,
    manaMax: c.stats.manaMax,
    range: c.stats.range,
    maxHp: Math.round(c.stats.hp * m)
  }
  // 装备加成
  for (const it of unit.items) {
    applyItemStats(s, it)
  }
  // 羁绊加成
  if (traitBonuses) {
    for (const b of traitBonuses) applyTraitBonus(s, b)
  }
  s.hp = s.maxHp
  return s
}

function applyItemStats(s, itemId) {
  const bi = BASE_ITEMS.find(x => x.id === itemId)
  if (bi) {
    if (bi.id === 'xuantie') s.atk += 15
    if (bi.id === 'lingyu') s.atkSpeed += 0.15
    if (bi.id === 'yusui') { /* 法强加成在技能计算时处理 */ }
    if (bi.id === 'youquan') { s.manaMax -= 5; if (s.manaMax < 10) s.manaMax = 10 }
    if (bi.id === 'xuanjia') s.armor += 20
    if (bi.id === 'jiaoren') s.mr += 20
    if (bi.id === 'lingmi') { s.maxHp += 150 }
    if (bi.id === 'chisha') { /* 暴击加成 */ }
    return
  }
  const fi = FULL_ITEMS.find(x => x.id === itemId)
  if (fi) {
    if (fi.id === 'kuangtu') s.maxHp += 400
    if (fi.id === 'jijing') s.armor += 45
    if (fi.id === 'longzhua') s.mr += 45
    if (fi.id === 'jiying') { s.atkSpeed += 0.45; s.range += 1 }
    if (fi.id === 'shouhu') s.maxHp += 200
  }
}

function applyTraitBonus(s, bonus) {
  // 体修：生命加成
  if (bonus.type === 'hpMult') { s.maxHp = Math.round(s.maxHp * (1 + bonus.val)); s.atk = Math.round(s.atk * (1 + bonus.val * 0)) }
  if (bonus.type === 'armorMr') { s.armor += bonus.val; s.mr += bonus.val }
  if (bonus.type === 'atkSpeed') { s.atkSpeed *= (1 + bonus.val) }
  if (bonus.type === 'atk') { s.atk += bonus.val }
}

/* 计算一方所有上阵单位的激活羁绊加成 */
export function computeTraitBonuses(units) {
  const count = {}
  for (const u of units) {
    for (const t of u.champ.traits) {
      count[t] = (count[t] || 0) + 1
    }
  }
  const bonuses = []
  for (const [traitName, n] of Object.entries(count)) {
    const trait = TRAITS[traitName]
    if (!trait) continue
    // 找激活的最高档
    let active = null
    for (const tier of trait.tiers) {
      if (n >= tier.n) active = tier
    }
    if (active) {
      bonuses.push({ trait: traitName, tier: active.n, desc: active.desc, ...traitEffect(traitName, active.n) })
    }
  }
  return bonuses
}

/* 将羁绊效果映射为可计算的加成 */
function traitEffect(traitName, tier) {
  switch (traitName) {
    case '体修':
      return { type: 'hpMult', val: tier === 4 ? 0.4 : 0.2 }
    case '器灵':
      return { type: 'armorMr', val: tier === 4 ? 60 : 25 }
    case '御剑':
      return { type: 'atkSpeed', val: tier === 4 ? 0.15 : 0.08 }
    case '影杀':
      return { type: 'atk', val: tier === 4 ? 20 : 10 }
    default:
      return { type: 'none', val: 0 }
  }
}

/* ---------- 战斗模拟 ---------- */
/* 简化的自动战斗：单位互相对砍，按攻击速度结算，有技能释放 */
export function simulateFight(attacker, defender) {
  // 双方生成战斗实例
  const aUnits = attacker.board.map(u => makeBattleUnit(u, computeTraitBonuses(attacker.board)))
  const dUnits = defender.board.map(u => makeBattleUnit(u, computeTraitBonuses(defender.board)))
  const aTotal = aUnits.length
  const dTotal = dUnits.length
  // 总战力估算：用于快速结算（保持可玩性，不做逐帧动画）
  const aPower = aUnits.reduce((s, u) => s + u.hp + u.atk * 3, 0)
  const dPower = dUnits.reduce((s, u) => s + u.hp + u.atk * 3, 0)
  const aWin = aPower > dPower
  // 计算存活单位数（用于扣血）
  const aSurvive = Math.max(1, Math.round(aUnits.length * (aWin ? 1 : 0.4)))
  const dSurvive = Math.max(1, Math.round(dUnits.length * (aWin ? 0.4 : 1)))
  return {
    aWin,
    aSurvive,
    dSurvive,
    aUnits: aUnits.length,
    dUnits: dUnits.length
  }
}

function makeBattleUnit(u, bonuses) {
  const stats = computeStats(u, bonuses)
  return { name: u.champ.name, star: u.star, hp: stats.hp, maxHp: stats.maxHp, atk: stats.atk, atkSpeed: stats.atkSpeed, armor: stats.armor, mr: stats.mr, mana: stats.mana, manaMax: stats.manaMax, range: stats.range, skill: u.champ.skill, champId: u.champ.id }
}

/* ---------- 对局管理 ---------- */
export class Game {
  constructor(playerName) {
    this.player = createPlayer(false, playerName)
    this.ais = []
    for (let i = 0; i < 7; i++) {
      this.ais.push(createPlayer(true, '对手' + (i + 1)))
    }
    this.round = 1       // 当前回合
    this.phase = 'shop'  // shop | fight | carousel | rune
    this.logs = []
    this.selectedRunes = [] // 当前待选符文
    this.player.board.push(makeUnit(pick(CHAMPIONS).id, 1))
  }

  /* 开始新回合：发利息、刷商店 */
  startRound() {
    const p = this.player
    // 利息
    const interest = interestOf(p.gold)
    p.gold += 5 + interest
    this.log(`回合 ${this.round}：基础 +5，利息 +${interest}，当前 ${p.gold} 金币`)
    // 自动刷新商店
    this.refreshShop()
    // 每 3 回合一次符文选择
    if (this.round % 3 === 0 && this.round <= 15) {
      this.phase = 'rune'
      this.selectedRunes = this.rollRunes()
    } else {
      this.phase = 'shop'
    }
  }

  rollRunes() {
    // 随机 3 个不同符文
    const shuffled = [...RUNES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  pickRune(runeId) {
    const r = RUNES.find(x => x.id === runeId)
    if (r) this.player.runes.push(r)
    this.phase = 'shop'
    this.log(`选择符文「${r.name}」`)
  }

  refreshShop() {
    this.player.shop = []
    for (let i = 0; i < 5; i++) {
      const cost = rollOne(SHOP_ODDS[this.player.level] || SHOP_ODDS[9])
      this.player.shop.push(randomChampByCost(cost))
    }
  }

  buyChamp(index) {
    const p = this.player
    const champ = p.shop[index]
    if (!champ) return false
    if (p.gold < champ.cost) { this.log('金币不足'); return false }
    p.gold -= champ.cost
    // 加入备战席（或尝试合成）
    this.addToBench(champ.id)
    p.shop[index] = null
    return true
  }

  addToBench(champId) {
    const p = this.player
    const bench = p.bench
    // 找已有同 id 且星级<3 的单位
    const same = bench.filter(u => u.champ.id === champId && u.star < 3)
    if (same.length >= 2) {
      // 三合一升星
      const base = same[0]
      base.star += 1
      // 移除另外两个
      let removed = 0
      p.bench = bench.filter(u => {
        if (u.champ.id === champId && u.star === base.star - 1 && removed < 2) {
          removed++
          return false
        }
        return true
      })
      this.log(`合成 ${base.champ.name} ${base.star} 星！`)
      return
    }
    p.bench.push(makeUnit(champId, 1))
  }

  sellBench(index) {
    const p = this.player
    const u = p.bench[index]
    if (!u) return
    const refund = Math.floor(u.champ.cost * STAR_MULT[u.star])
    p.gold += refund
    p.bench.splice(index, 1)
    this.log(`出售 ${u.champ.name} +${refund} 金币`)
  }

  /* 上阵/下阵 */
  deployBench(benchIndex, boardIndex) {
    const p = this.player
    const u = p.bench[benchIndex]
    if (!u) return
    if (p.board.length >= p.level) { this.log('人口已满，先升级！'); return }
    p.board[boardIndex] = u
    p.bench.splice(benchIndex, 1)
  }

  recallBoard(boardIndex) {
    const p = this.player
    const u = p.board[boardIndex]
    if (!u) return
    if (p.bench.length >= 9) { this.log('备战席已满'); return }
    p.bench.push(u)
    p.board[boardIndex] = null
  }

  /* 升级人口 */
  levelUp() {
    const p = this.player
    if (p.level >= 9) { this.log('已达最高人口'); return false }
    const cost = LEVEL_UP_COST[p.level + 1]
    if (p.gold < cost) { this.log('金币不足，升级需 ' + cost); return false }
    p.gold -= cost
    p.level += 1
    this.log(`升级到 ${p.level} 人口`)
    return true
  }

  /* D 牌（刷新商店） */
  refreshShopPaid() {
    const p = this.player
    const cost = 2
    if (p.gold < cost) { this.log('金币不足'); return false }
    p.gold -= cost
    this.refreshShop()
    return true
  }

  /* 装备合成：两个散件合成成品 */
  combineItems(id1, id2) {
    const fi = FULL_ITEMS.find(x =>
      (x.a === id1 && x.b === id2) || (x.a === id2 && x.b === id1))
    return fi || null
  }

  /* 进入战斗阶段 */
  fight() {
    const p = this.player
    // 随机选一个 AI 对手
    const aliveAIs = this.ais.filter(a => a.alive)
    const enemy = aliveAIs[rand(aliveAIs.length)]
    if (!enemy) return { over: true, winner: true }

    // AI 自动组建队伍
    this.autoBuildAI(enemy)

    const result = simulateFight(p, enemy)
    // 结算
    if (result.aWin) {
      const dmg = result.aSurvive + this.player.level
      enemy.hp -= dmg
      this.player.lastFight = 'win'
      this.log(`回合 ${this.round}：战胜 ${enemy.name}，对其造成 ${dmg} 伤害`)
    } else {
      const dmg = result.dSurvive + enemy.level
      p.hp -= dmg
      this.player.lastFight = 'lose'
      this.log(`回合 ${this.round}：战败，损失 ${dmg} 生命`)
    }

    // 检查淘汰
    if (enemy.hp <= 0) { enemy.alive = false; enemy.hp = 0 }
    if (p.hp <= 0) {
      p.alive = false
      return { over: true, winner: false, result }
    }
    // 检查是否吃鸡
    const aliveCount = this.ais.filter(a => a.alive).length
    if (aliveCount === 0) {
      return { over: true, winner: true, result }
    }

    this.round += 1
    this.startRound()
    return { over: false, result }
  }

  /* AI 自动组建队伍 */
  autoBuildAI(ai) {
    // 简化的 AI：按人口随机上阵
    const target = Math.min(ai.level, ai.board.length + ai.bench.length)
    while (ai.board.length < target && ai.bench.length > 0) {
      ai.board.push(ai.bench.shift())
    }
    // 每回合 AI 买点棋子
    const budget = Math.min(ai.gold, 10)
    ai.gold -= budget
    for (let i = 0; i < Math.floor(budget / 2); i++) {
      const c = randomChampByCost(rand(ai.level) + 1)
      if (ai.bench.length < 9) ai.bench.push(makeUnit(c.id, 1))
    }
    // 人口成长
    if (ai.gold > 20 && ai.level < 9 && Math.random() < 0.5) {
      ai.gold -= 4
      ai.level += 1
    }
  }

  log(msg) {
    this.logs.push(msg)
    if (this.logs.length > 50) this.logs.shift()
  }
}
