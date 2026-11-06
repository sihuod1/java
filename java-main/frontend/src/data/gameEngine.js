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
export function createPlayer(isAI = false, name = '召唤师', avatar = null) {
  return {
    name,
    isAI,
    avatar,             // 头像（对手栏展示用）
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
  // 散件（按首页装备名判断）
  const bi = BASE_ITEMS.find(x => x.id === itemId)
  if (bi) {
    switch (bi.name) {
      case '暴风大剑': s.atk += 15; break
      case '反曲之弓': s.atkSpeed += 0.15; break
      case '无用大棒': s.ap = (s.ap || 0) + 15; break            // 法强
      case '女神之泪': s.manaMax += 15; break                    // 法力
      case '锁子甲': s.armor += 25; break
      case '负极斗篷': s.mr += 25; break
      case '巨人腰带': s.maxHp += 200; break
      case '拳套': s.critRate = (s.critRate || 0) + 0.1; break   // 暴击率
      case '金铲铲': break                                      // 转职徽章，无属性
    }
    return
  }
  // 成装
  const fi = FULL_ITEMS.find(x => x.id === itemId)
  if (fi) {
    switch (fi.name) {
      case '死亡之刃': s.atk += 30; break
      case '疾射火炮': s.atkSpeed += 0.3; s.range += 1; break
      case '灭世者的死亡之帽': s.ap = (s.ap || 0) + 45; break
      case '蓝霸符': s.manaMax += 30; break
      case '荆棘之甲': s.armor += 50; break
      case '龙爪': s.mr += 50; break
      case '狂徒铠甲': s.maxHp += 400; break
      case '窃贼手套': s.critRate = (s.critRate || 0) + 0.2; break
      case '巨人杀手': s.atk += 15; s.atkSpeed += 0.15; break
      case '海克斯科技枪刃': s.atk += 15; s.ap = (s.ap || 0) + 15; break
      case '守护天使': s.atk += 15; s.armor += 25; break
      case '饮血剑': s.atk += 15; s.mr += 25; break
      case '鬼索的狂暴之刃': s.atkSpeed += 0.15; s.ap = (s.ap || 0) + 15; break
      case '莫雷洛秘典': s.ap = (s.ap || 0) + 15; s.maxHp += 200; break
      case '石像鬼板甲': s.ap = (s.ap || 0) + 15; s.armor += 25; break
      case '大天使之杖': s.ap = (s.ap || 0) + 15; s.manaMax += 15; break
      case '剑士徽章': case '游侠徽章': case '法师徽章': break  // 转职徽章，无战斗属性
    }
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
    if (!u) continue   // 跳过棋盘空位
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
  // 双方生成战斗实例（过滤棋盘空位）
  const aUnits = attacker.board.filter(Boolean).map(u => makeBattleUnit(u, computeTraitBonuses(attacker.board)))
  const dUnits = defender.board.filter(Boolean).map(u => makeBattleUnit(u, computeTraitBonuses(defender.board)))
  const aTotal = aUnits.length
  const dTotal = dUnits.length
  // 总战力估算：用于快速结算（保持可玩性，不做逐帧动画）
  const aPower = aUnits.reduce((s, u) => s + u.hp + u.atk * 3, 0)
  const dPower = dUnits.reduce((s, u) => s + u.hp + u.atk * 3, 0)
  const aWin = aPower > dPower
  // 计算存活单位数（用于扣血）
  const aSurvive = Math.max(1, Math.round(aUnits.length * (aWin ? 1 : 0.4)))
  const dSurvive = Math.max(1, Math.round(dUnits.length * (aWin ? 0.4 : 1)))

  // 生成战斗过程事件序列（用于前端逐帧动画回放）
  const events = buildFightEvents(aUnits, dUnits, aWin)

  return {
    aWin,
    aSurvive,
    dSurvive,
    aUnits: aUnits.length,
    dUnits: dUnits.length,
    // 供动画展示的双方阵容明细（含属性 + 头像）
    roster: {
      ally: aUnits.map(u => ({ name: u.name, cost: u.champId ? costOf(u.champId) : 1, star: u.star, hp: u.maxHp, atk: u.atk, avatar: u.avatar, manaMax: u.manaMax, skillName: (u.skill && u.skill.name) || '' })),
      enemy: dUnits.map(u => ({ name: u.name, cost: u.champId ? costOf(u.champId) : 1, star: u.star, hp: u.maxHp, atk: u.atk, avatar: u.avatar, manaMax: u.manaMax, skillName: (u.skill && u.skill.name) || '' }))
    },
    events
  }
}

function costOf(champId) {
  const c = CHAMPIONS.find(x => x.id === champId)
  return c ? c.cost : 1
}

/* 依据战力胜负，编排一场真实的逐帧攻防事件序列（用于前端动画回放）
 * 含法力系统：普攻积攒蓝条，叠满自动释放技能；
 * 被动技能英雄（manaMax=0）每第 3 次攻击附带技能伤害 */
function buildFightEvents(aUnits, dUnits, aWin) {
  const events = []
  // 建立带实时血量/蓝量的战斗单位（拷贝，避免污染原数据）
  const mk = (u) => ({
    name: u.name, cost: u.champId ? costOf(u.champId) : 1,
    hp: u.maxHp, maxHp: u.maxHp, atk: u.atk,
    mana: Math.round((u.manaMax || 0) * 0.25),   // 开局自带 25% 蓝量
    manaMax: u.manaMax || 0,
    skillName: (u.skill && u.skill.name) || '',
    atkCount: 0
  })
  const aAlive = aUnits.map(mk)
  const dAlive = dUnits.map(mk)

  const aliveIdx = (list) => {
    const idx = []
    list.forEach((u, i) => { if (u.hp > 0) idx.push(i) })
    return idx
  }

  // 攻击动作：从 attacking 列表随机选一个存活者，攻击 defending 列表随机存活者
  function doAttack(attacking, defending, atkSide, defSide) {
    const atkIdxArr = aliveIdx(attacking)
    const defIdxArr = aliveIdx(defending)
    if (atkIdxArr.length === 0 || defIdxArr.length === 0) return false
    const ai = atkIdxArr[Math.floor(Math.random() * atkIdxArr.length)]
    const di = defIdxArr[Math.floor(Math.random() * defIdxArr.length)]
    const atk = attacking[ai]
    const def = defending[di]
    atk.atkCount++
    let dmg, crit = false, skillName = ''

    // 主动技能：蓝条叠满 → 本次攻击变成技能释放，伤害更高并清空蓝条
    if (atk.manaMax > 0 && atk.skillName && atk.mana >= atk.manaMax) {
      dmg = Math.max(1, Math.round(atk.atk * 2.8 * (0.9 + Math.random() * 0.3)))
      skillName = atk.skillName
      atk.mana = 0
    } else if (atk.manaMax === 0 && atk.skillName && atk.atkCount % 3 === 0) {
      // 被动技能（无蓝条）：每第 3 次攻击附带技能伤害
      dmg = Math.max(1, Math.round(atk.atk * 2.2 * (0.9 + Math.random() * 0.3)))
      skillName = atk.skillName
    } else {
      // 普通攻击：积攒蓝量
      crit = Math.random() < 0.18
      dmg = Math.max(1, Math.round(atk.atk * (1.6 + Math.random() * 1.2) * (crit ? 2.0 : 1)))
      if (atk.manaMax > 0) {
        atk.mana = Math.min(atk.manaMax, atk.mana + 14)
      }
    }

    def.hp -= dmg
    if (def.hp <= 0) def.hp = 0
    events.push({
      atkSide, defSide,
      atkIdx: ai, defIdx: di,
      atkName: atk.name, defName: def.name,
      dmg, crit, kill: def.hp <= 0,
      skillName, manaAfter: atk.mana, manaMax: atk.manaMax
    })
    return true
  }

  // 回合制对砍，最多 40 个动作，直到一方全灭
  let guard = 0
  while (guard++ < 40) {
    const aIdx = aliveIdx(aAlive)
    const dIdx = aliveIdx(dAlive)
    if (aIdx.length === 0 || dIdx.length === 0) break

    // 战力强的一方先手，随后弱方反击；交替进行
    if (aWin) {
      if (!doAttack(aAlive, dAlive, 'ally', 'enemy')) break
      if (!doAttack(dAlive, aAlive, 'enemy', 'ally')) break
    } else {
      if (!doAttack(dAlive, aAlive, 'enemy', 'ally')) break
      if (!doAttack(aAlive, dAlive, 'ally', 'enemy')) break
    }
  }

  // 确保结果与战力判定一致：强方存活、弱方全灭
  const winnerList = aWin ? aAlive : dAlive
  const loserList = aWin ? dAlive : aAlive
  const winnerSide = aWin ? 'ally' : 'enemy'
  const loserSide = aWin ? 'enemy' : 'ally'
  // 若弱方还有存活（理论上战力判定会赢），补刀清场
  const loserAlive = aliveIdx(loserList)
  const winnerAlive = aliveIdx(winnerList)
  for (const li of loserAlive) {
    if (winnerAlive.length === 0) break
    const wi = winnerAlive[Math.floor(Math.random() * winnerAlive.length)]
    const dmg = Math.max(1, loserList[li].hp)
    loserList[li].hp = 0
    const winner = winnerList[wi]
    events.push({
      atkSide: winnerSide, defSide: loserSide,
      atkIdx: wi, defIdx: li,
      atkName: winner.name, defName: loserList[li].name,
      dmg, crit: false, kill: true,
      skillName: '', manaAfter: winner.mana, manaMax: winner.manaMax
    })
  }

  return events
}

function makeBattleUnit(u, bonuses) {
  const stats = computeStats(u, bonuses)
  return { name: u.champ.name, star: u.star, hp: stats.hp, maxHp: stats.maxHp, atk: stats.atk, atkSpeed: stats.atkSpeed, armor: stats.armor, mr: stats.mr, mana: stats.mana, manaMax: stats.manaMax, range: stats.range, skill: u.champ.skill, champId: u.champ.id, avatar: u.champ.avatar || null }
}

/* ---------- 对局管理 ---------- */
export class Game {
  constructor(playerName) {
    this.player = createPlayer(false, playerName)
    this.ais = []
    for (let i = 0; i < 7; i++) {
      const champ = CHAMPIONS[i % CHAMPIONS.length]
      this.ais.push(createPlayer(true, '玩家' + (i + 1), champ.avatar || null))
    }
    this.round = 1       // 当前回合
    this.phase = 'shop'  // shop | fight | carousel | rune
    this.logs = []
    this.selectedRunes = [] // 当前待选符文
    this.currentEnemy = null // 本回合随机到的对手（战斗结算时记录）
    this.player.board.push(makeUnit(pick(CHAMPIONS).id, 1))

    // 开局随机赠送一对可合成的散件，让玩家立即体验「合成成装」
    // 从成装配方向随机抽一条，再反推两个散件，保证这两个散件一定能合成
    const recipe = pick(FULL_ITEMS)
    this.player.baseItems.push({ id: recipe.a }, { id: recipe.b })
    this.log(`开局赠送散件「${recipe.a}」「${recipe.b}」，点击背包中的两件散件即可合成「${recipe.name}」`)
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
    // 先把新买的一星单位放进去，再尝试合成升星
    p.bench.push(makeUnit(champId, 1))
    this.tryMergeChamp(champId)
  }

  /* 合成升星：同 id 同星级满 3 个 → 升 1 星
   * 金铲铲规则：备战席和棋盘上的单位一起计数；
   * 升星结果优先保留在棋盘上（原地升星），多余的从备战席移除 */
  tryMergeChamp(champId) {
    const p = this.player
    let merged = true
    while (merged) {
      merged = false
      for (let star = 1; star < 3; star++) {
        // 收集备战席 + 棋盘上（非空）的所有同 id 同星单位
        const cands = [
          ...p.bench.map(u => ({ u, from: 'bench' })),
          ...p.board.map((u, i) => u ? ({ u, from: 'board', boardIndex: i }) : null).filter(Boolean)
        ].filter(x => x.u.champ.id === champId && x.u.star === star)
        if (cands.length < 3) continue
        // 保留优先级：场上单位（原地升星）> 备战席第一个
        const base = cands.find(x => x.from === 'board') || cands[0]
        base.u.star = star + 1
        // 移除另外两个（candidates 备战席在前，天然优先移备战席，减少棋盘空位）
        const remove = cands.filter(x => x !== base).slice(0, 2)
        // 被移除单位身上的装备退回背包
        for (const r of remove) {
          if (r.u.items && r.u.items.length) {
            p.baseItems.push(...r.u.items.map(id => ({ id })))
          }
        }
        for (const r of remove) {
          if (r.from === 'bench') {
            p.bench.splice(p.bench.indexOf(r.u), 1)
          } else {
            p.board[r.boardIndex] = null
          }
        }
        this.log(`合成 ${base.u.champ.name} ${base.u.star} 星！`)
        merged = true
        break
      }
    }
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
    // 人口按「场上非空单位数」计算：下阵后的空位(null)不算人口
    const used = p.board.filter(x => x).length
    if (used >= p.level) { this.log('人口已满，先升级！'); return }
    if (p.board[boardIndex]) { this.log('该位置已有单位'); return }
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

  /* 在背包里合成：点两个散件 → 合成成装（成装进入背包） */
  combineTwoInBag(i1, i2) {
    const p = this.player
    const a = p.baseItems[i1]
    const b = p.baseItems[i2]
    if (!a || !b) return null
    if (i1 === i2) { this.log('请选择两个不同的散件'); return null }
    // 成装不能再参与合成（成装只用于佩戴，取下时自动拆回两件散件）
    const isBase = it => BASE_ITEMS.some(x => x.id === it.id)
    if (!isBase(a) || !isBase(b)) {
      this.log('成装无法再参与合成，可直接佩戴到英雄身上')
      return null
    }
    // 两个散件（名字）合成
    const fi = this.combineItems(a.id, b.id)
    if (!fi) { this.log(`「${a.name || a.id}」和「${b.name || b.id}」没有合成配方`); return null }
    // 从背包移除两个散件（先删索引大的，避免错位）
    const hi = Math.max(i1, i2)
    const lo = Math.min(i1, i2)
    p.baseItems.splice(hi, 1)
    p.baseItems.splice(lo, 1)
    // 成装进入背包
    p.baseItems.push({ id: fi.id })
    this.log(`合成成品「${fi.name}」！${fi.desc}`)
    return fi
  }

  /* 获取某散件能合成的所有成装（用于合成图鉴提示） */
  combosOfBase(baseId) {
    const combos = []
    for (const fi of FULL_ITEMS) {
      if (fi.a === baseId || fi.b === baseId) {
        const other = fi.a === baseId ? fi.b : fi.a
        combos.push({ full: fi, other })
      }
    }
    return combos
  }

  /* 判断是否野怪回合（金铲铲规则：开局前3回合 + 之后每5回合一次） */
  isMonsterRound() {
    const r = this.round
    return r <= 3 || (r > 3 && r % 5 === 1)
  }

  /* 野怪回合掉落散件 */
  dropItem() {
    const p = this.player
    if (p.baseItems.length >= 12) { this.log('散件背包已满'); return null }
    const item = BASE_ITEMS[rand(BASE_ITEMS.length)]
    p.baseItems.push({ id: item.id })
    this.log(`野怪掉落散件「${item.name}」（${item.stat}）`)
    return item
  }

  /* 给棋盘上的单位佩戴装备（散件或成装），最多 3 件 */
  equipItem(itemIndex, boardIndex) {
    const p = this.player
    const item = p.baseItems[itemIndex]
    const unit = p.board[boardIndex]
    if (!item) { this.log('没有该装备'); return false }
    if (!unit) { this.log('该位置没有单位'); return false }
    if (unit.items.length >= 3) { this.log(`${unit.champ.name} 已满 3 件装备`); return false }

    p.baseItems.splice(itemIndex, 1)
    unit.items.push(item.id)
    const detail = BASE_ITEMS.find(x => x.id === item.id) || FULL_ITEMS.find(x => x.id === item.id)
    this.log(`为 ${unit.champ.name} 佩戴「${detail ? detail.name : item.id}」${detail && detail.stat ? '（' + detail.stat + '）' : ''}`)
    // 返回佩戴结果信息，供前端提示
    return { ok: true, unitName: unit.champ.name, itemName: detail ? detail.name : item.id, stat: detail ? detail.stat : '' }
  }

  /* 取下单位身上的装备（回到散件背包，成装拆回两件散件） */
  unequipItem(boardIndex, itemId) {
    const p = this.player
    const unit = p.board[boardIndex]
    if (!unit) return false
    const idx = unit.items.indexOf(itemId)
    if (idx < 0) return false
    unit.items.splice(idx, 1)

    // 判断是成装还是散件
    const fi = FULL_ITEMS.find(x => x.id === itemId)
    if (fi) {
      // 成装拆回两件散件
      p.baseItems.push({ id: fi.a }, { id: fi.b })
      this.log(`拆解「${fi.name}」为两件散件`)
    } else {
      p.baseItems.push({ id: itemId })
      this.log(`取下装备`)
    }
    return true
  }

  /* 进入战斗阶段 */
  fight() {
    const p = this.player

    // 野怪回合：打野怪（弱阵容），胜利掉落散件，不扣 AI 血量
    if (this.isMonsterRound()) {
      return this.fightMonster()
    }

    // 收集所有存活参战者：玩家 + 7 个人机
    const fighters = [
      { player: p, name: p.name, isAI: false },
      ...this.ais.filter(a => a.alive).map(a => ({ player: a, name: a.name, isAI: true }))
    ]
    if (fighters.length === 0) return { over: true, winner: true }
    if (fighters.length === 1) {
      // 只剩玩家一个 → 吃鸡
      return { over: true, winner: true }
    }

    // 按血量从高到低排序，两两配对
    fighters.sort((x, y) => y.player.hp - x.player.hp)

    // 记录本回合玩家对局结果（用于动画展示）
    let playerResult = null

    // 两两配对战斗（血量高 vs 血量低）
    const pairs = []
    for (let i = 0; i + 1 < fighters.length; i += 2) {
      pairs.push([fighters[i], fighters[i + 1]])
    }
    // 奇数个 → 最后一名轮空
    const bye = fighters.length % 2 === 1 ? fighters[fighters.length - 1] : null
    if (bye) this.log(`回合 ${this.round}：${bye.name} 轮空`)

    // 逐对战斗并结算
    for (const [a, b] of pairs) {
      // AI 自动组建队伍
      if (a.isAI) this.autoBuildAI(a.player)
      if (b.isAI) this.autoBuildAI(b.player)

      const result = simulateFight(a.player, b.player)

      // 结算血量
      if (result.aWin) {
        const dmg = result.aSurvive + a.player.level
        b.player.hp -= dmg
        a.player.lastFight = 'win'
        b.player.lastFight = 'lose'
        this.log(`回合 ${this.round}：${a.name} 战胜 ${b.name}（-${dmg}）`)
      } else {
        const dmg = result.dSurvive + b.player.level
        a.player.hp -= dmg
        a.player.lastFight = 'lose'
        b.player.lastFight = 'win'
        this.log(`回合 ${this.round}：${b.name} 战胜 ${a.name}（-${dmg}）`)
      }

      // 若这对里包含玩家，记录玩家对局结果（含阵容用于动画）
      if (!a.isAI || !b.isAI) {
        const isPlayerA = !a.isAI
        const allyPlayer = isPlayerA ? a.player : b.player
        const enemyPlayer = isPlayerA ? b.player : a.player
        const allyWon = isPlayerA ? result.aWin : !result.aWin
        // 将结果转成「我方视角」的 roster/events
        playerResult = {
          aWin: allyWon,
          result: {
            ...result,
            aWin: allyWon,
            roster: allyWon ? result.roster : { ally: result.roster.enemy, enemy: result.roster.ally },
            enemy: { name: enemyPlayer.name, hp: enemyPlayer.hp, level: enemyPlayer.level }
          }
        }
      }
    }

    // 标记淘汰（血量 <= 0）
    for (const f of fighters) {
      if (f.player.hp <= 0 && f.player !== p) {
        f.player.alive = false
        f.player.hp = 0
        this.log(`${f.name} 出局！`)
      }
    }

    // 判断玩家是否出局 / 吃鸡
    if (p.hp <= 0) {
      p.alive = false
      p.hp = 0
      return { over: true, winner: false, result: playerResult ? playerResult.result : null }
    }
    const aliveCount = this.ais.filter(a => a.alive).length
    if (aliveCount === 0) {
      return { over: true, winner: true, result: playerResult ? playerResult.result : null }
    }

    // 更新 currentEnemy 为下一回合排序后的首个对手（血量最高者）
    const nextAlive = this.ais.filter(a => a.alive).sort((x, y) => y.hp - x.hp)
    this.currentEnemy = nextAlive[0] || null

    this.round += 1
    this.startRound()
    return { over: false, result: playerResult ? playerResult.result : null }
  }

  /* 野怪回合：打野怪，胜利掉落散件 */
  fightMonster() {
    const p = this.player
    // 生成野怪：弱阵容（1-2 个 1 费单位），保证玩家初始能打
    const monster = createPlayer(true, '野怪', null)
    monster.level = 1
    const count = this.round <= 2 ? 1 : 2
    for (let i = 0; i < count; i++) {
      const c = randomChampByCost(1)
      monster.board.push(makeUnit(c.id, 1))
    }
    this.currentEnemy = monster

    const result = simulateFight(p, monster)
    result.enemy = { name: '野怪', hp: 0, level: 1, monster: true }

    if (result.aWin) {
      this.player.lastFight = 'win'
      this.log(`回合 ${this.round}：战胜野怪`)
      this.dropItem()
    } else {
      // 野怪回合失败不扣太多血（保底体验）
      const dmg = Math.max(1, result.dSurvive)
      p.hp -= dmg
      this.player.lastFight = 'lose'
      this.log(`回合 ${this.round}：被野怪击败，损失 ${dmg} 生命`)
    }

    if (p.hp <= 0) {
      p.alive = false
      return { over: true, winner: false, result }
    }

    this.round += 1
    this.startRound()
    return { over: false, result }
  }

  /* AI 自动组建队伍 */
  autoBuildAI(ai) {
    // 每回合 AI 获得经济（基础 + 少量成长），用于买棋子
    ai.gold += 5 + Math.min(ai.level, 5)

    // 先买棋子填满备战席（保证有单位可上阵）
    while (ai.bench.length < 9 && ai.gold >= 2) {
      const c = randomChampByCost(rand(Math.max(ai.level, 1)) + 1)
      if (!c) break
      ai.gold -= c.cost
      ai.bench.push(makeUnit(c.id, 1))
    }

    // 上阵到棋盘，直到达到人口上限或备战席空
    const target = Math.min(ai.level, ai.board.length + ai.bench.length)
    while (ai.board.length < target && ai.bench.length > 0) {
      ai.board.push(ai.bench.shift())
    }

    // 人口成长（后期随回合变强）
    if (ai.level < 9 && Math.random() < 0.6) {
      ai.level += 1
    }
  }

  log(msg) {
    this.logs.push(msg)
    if (this.logs.length > 50) this.logs.shift()
  }
}
