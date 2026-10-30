/* ============================================================
 * 金铲铲之战 · 自走棋游戏数据层
 * 参考《金铲铲之战》真实玩法，棋子/羁绊/装备为原创精简可玩版本
 * ============================================================ */

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

/* ---------- 棋子 ----------
 * cost: 1-5 费用
 * traits: [种族, 职业]
 * stats: { hp, atk, atkSpeed(每秒攻击次数), armor, mr, mana(初始/上限), range(1=近战,2+=远程) }
 * skill: { name, desc, type, ...params }
 * role: 主C / 前排 / 功能
 */
export const CHAMPIONS = [
  /* ===== 1 费 ===== */
  { id: 'shigandang', name: '石敢当', cost: 1, traits: ['山海', '体修'], role: '前排',
    stats: { hp: 680, atk: 45, atkSpeed: 0.6, armor: 40, mr: 25, mana: 30, manaMax: 70, range: 1 },
    skill: { name: '泰山镇', desc: '获得自身 25% 生命的护盾 3 秒，并对周围敌人造成 120 物理伤害', type: 'shield_aoe' } },
  { id: 'qingqiu', name: '青丘小狐', cost: 1, traits: ['妖庭', '符箓'], role: '法系',
    stats: { hp: 500, atk: 40, atkSpeed: 0.65, armor: 15, mr: 30, mana: 0, manaMax: 50, range: 3 },
    skill: { name: '狐火', desc: '对最近敌人发射狐火，造成 180 魔法伤害', type: 'nuke' } },
  { id: 'jianzhong', name: '剑冢学徒', cost: 1, traits: ['仙门', '御剑'], role: '物理',
    stats: { hp: 520, atk: 48, atkSpeed: 0.7, armor: 20, mr: 20, mana: 0, manaMax: 40, range: 1 },
    skill: { name: '剑气纵横', desc: '挥出剑气，对前方 2 格内敌人造成 160 物理伤害', type: 'aoe_phys' } },
  { id: 'yaocao', name: '药谷草精', cost: 1, traits: ['木灵', '丹师'], role: '功能',
    stats: { hp: 500, atk: 35, atkSpeed: 0.6, armor: 15, mr: 30, mana: 20, manaMax: 60, range: 3 },
    skill: { name: '回春', desc: '治疗血量最低的友军 200 生命', type: 'heal' } },
  { id: 'shanjing', name: '山魈', cost: 1, traits: ['山海', '影杀'], role: '物理',
    stats: { hp: 540, atk: 50, atkSpeed: 0.68, armor: 18, mr: 18, mana: 0, manaMax: 45, range: 1 },
    skill: { name: '偷袭', desc: '跳向最远敌人，造成 170 物理伤害', type: 'assassinate' } },
  { id: 'xiaohe', name: '灵鹤童子', cost: 1, traits: ['仙门', '驭兽'], role: '功能',
    stats: { hp: 500, atk: 38, atkSpeed: 0.62, armor: 18, mr: 25, mana: 10, manaMax: 55, range: 3 },
    skill: { name: '鹤唳', desc: '召唤一只灵鹤攻击随机敌人，造成 150 魔法伤害', type: 'summon' } },

  /* ===== 2 费 ===== */
  { id: 'baize', name: '白泽', cost: 2, traits: ['山海', '符箓'], role: '法系',
    stats: { hp: 620, atk: 45, atkSpeed: 0.6, armor: 20, mr: 40, mana: 20, manaMax: 70, range: 4 },
    skill: { name: '破妄真言', desc: '对目标区域降下法阵，造成 240 魔法伤害并降低 20 魔抗 4 秒', type: 'aoe_magic' } },
  { id: 'yingzhao', name: '英招', cost: 2, traits: ['山海', '驭兽'], role: '功能',
    stats: { hp: 580, atk: 50, atkSpeed: 0.65, armor: 25, mr: 30, mana: 15, manaMax: 60, range: 2 },
    skill: { name: '驱兽令', desc: '使己方所有单位攻速 +25% 持续 5 秒', type: 'buff' } },
  { id: 'huli', name: '九尾狐', cost: 2, traits: ['妖庭', '影杀'], role: '法系',
    stats: { hp: 560, atk: 48, atkSpeed: 0.7, armor: 18, mr: 35, mana: 0, manaMax: 50, range: 3 },
    skill: { name: '魅惑', desc: '魅惑一名敌人 2 秒，使其攻击友军', type: 'charm' } },
  { id: 'yaodan', name: '炼丹童子', cost: 2, traits: ['木灵', '丹师'], role: '功能',
    stats: { hp: 540, atk: 42, atkSpeed: 0.6, armor: 18, mr: 35, mana: 15, manaMax: 65, range: 3 },
    skill: { name: '灵丹', desc: '治疗全体友军 120 生命，并解除一个负面效果', type: 'heal_aoe' } },
  { id: 'xuanwu', name: '玄武甲士', cost: 2, traits: ['器灵', '体修'], role: '前排',
    stats: { hp: 760, atk: 42, atkSpeed: 0.55, armor: 50, mr: 30, mana: 30, manaMax: 80, range: 1 },
    skill: { name: '龟息', desc: '进入龟息状态，受到的伤害 -50% 持续 3 秒', type: 'defend' } },
  { id: 'jianhun', name: '剑灵残魂', cost: 2, traits: ['器灵', '御剑'], role: '物理',
    stats: { hp: 560, atk: 55, atkSpeed: 0.72, armor: 20, mr: 20, mana: 0, manaMax: 45, range: 1 },
    skill: { name: '万剑归宗', desc: '释放 3 道剑气，每道造成 90 物理伤害', type: 'multi_hit' } },

  /* ===== 3 费 ===== */
  { id: 'luwu', name: '陆吾', cost: 3, traits: ['山海', '体修'], role: '前排',
    stats: { hp: 880, atk: 60, atkSpeed: 0.6, armor: 55, mr: 35, mana: 30, manaMax: 90, range: 1 },
    skill: { name: '昆仑之威', desc: '震慑周围敌人 1.5 秒，并造成 200 物理伤害', type: 'cc_aoe' } },
  { id: 'zhuyin', name: '烛龙', cost: 3, traits: ['山海', '符箓'], role: '法系',
    stats: { hp: 700, atk: 55, atkSpeed: 0.6, armor: 25, mr: 45, mana: 25, manaMax: 80, range: 4 },
    skill: { name: '烛照九幽', desc: '对最远敌人造成 300 魔法伤害，若其生命低于 40% 则斩杀', type: 'execute' } },
  { id: 'qiongqi', name: '穷奇', cost: 3, traits: ['妖庭', '影杀'], role: '物理',
    stats: { hp: 700, atk: 62, atkSpeed: 0.75, armor: 25, mr: 25, mana: 0, manaMax: 50, range: 1 },
    skill: { name: '嗜血突袭', desc: '跳向生命最低的敌人，造成 260 物理伤害并回复等量生命', type: 'assassinate_heal' } },
  { id: 'biyan', name: '碧眼金蝉', cost: 3, traits: ['木灵', '丹师'], role: '功能',
    stats: { hp: 650, atk: 48, atkSpeed: 0.65, armor: 25, mr: 40, mana: 20, manaMax: 70, range: 3 },
    skill: { name: '金蝉脱壳', desc: '治疗血量最低友军 300，并使其免疫伤害 1 秒', type: 'save' } },
  { id: 'chilong', name: '赤焰狌狌', cost: 3, traits: ['仙门', '御剑'], role: '物理',
    stats: { hp: 680, atk: 60, atkSpeed: 0.7, armor: 30, mr: 25, mana: 0, manaMax: 55, range: 2 },
    skill: { name: '狌狌火剑', desc: '挥出火焰剑气，造成 240 物理伤害并附加灼烧 4 秒', type: 'burn' } },
  { id: 'xuanming', name: '玄冥龟', cost: 3, traits: ['器灵', '体修'], role: '前排',
    stats: { hp: 920, atk: 50, atkSpeed: 0.5, armor: 60, mr: 40, mana: 40, manaMax: 100, range: 1 },
    skill: { name: '玄冥护体', desc: '获得 400 护盾，并将受到的 30% 伤害反弹给攻击者', type: 'reflect' } },

  /* ===== 4 费 ===== */
  { id: 'kun', name: '鲲', cost: 4, traits: ['山海', '体修'], role: '前排',
    stats: { hp: 1050, atk: 65, atkSpeed: 0.55, armor: 65, mr: 45, mana: 40, manaMax: 110, range: 1 },
    skill: { name: '鲲吞', desc: '吞下最近敌人 2 秒，期间对其造成 400 魔法伤害', type: 'swallow' } },
  { id: 'chongming', name: '重明鸟', cost: 4, traits: ['山海', '符箓'], role: '法系',
    stats: { hp: 780, atk: 60, atkSpeed: 0.65, armor: 25, mr: 50, mana: 30, manaMax: 90, range: 4 },
    skill: { name: '重明破邪', desc: '对全体敌人造成 280 魔法伤害，并对幽都单位额外 50% 伤害', type: 'aoe_magic' } },
  { id: 'bifang', name: '毕方', cost: 4, traits: ['妖庭', '御剑'], role: '物理',
    stats: { hp: 760, atk: 68, atkSpeed: 0.78, armor: 30, mr: 30, mana: 0, manaMax: 60, range: 2 },
    skill: { name: '毕方火羽', desc: '发射火羽，对最多 3 名敌人各造成 220 物理伤害并灼烧', type: 'multi_burn' } },
  { id: 'yaohou', name: '妖后', cost: 4, traits: ['妖庭', '符箓'], role: '法系',
    stats: { hp: 720, atk: 55, atkSpeed: 0.65, armor: 25, mr: 48, mana: 25, manaMax: 85, range: 4 },
    skill: { name: '妖后威仪', desc: '魅惑一名敌人 2.5 秒，并对其造成 350 魔法伤害', type: 'charm_nuke' } },
  { id: 'chixiao', name: '赤霄剑仙', cost: 4, traits: ['仙门', '御剑'], role: '主C',
    stats: { hp: 800, atk: 70, atkSpeed: 0.75, armor: 30, mr: 30, mana: 0, manaMax: 55, range: 2 },
    skill: { name: '赤霄斩', desc: '对一条直线的敌人造成 300 物理伤害，暴击伤害翻倍', type: 'line_phys' } },
  { id: 'shennong', name: '神农氏', cost: 4, traits: ['木灵', '丹师'], role: '功能',
    stats: { hp: 800, atk: 55, atkSpeed: 0.6, armor: 30, mr: 45, mana: 30, manaMax: 95, range: 3 },
    skill: { name: '百草恩泽', desc: '治疗全体友军 250 生命，并使全体免疫控制 3 秒', type: 'heal_cleanse' } },

  /* ===== 5 费 ===== */
  { id: 'yinglong', name: '应龙·天渊', cost: 5, traits: ['山海', '御剑'], role: '主C',
    stats: { hp: 980, atk: 75, atkSpeed: 0.7, armor: 40, mr: 45, mana: 40, manaMax: 120, range: 3 },
    skill: { name: '应龙九霄', desc: '召唤九霄龙威，对全体敌人造成 420 魔法伤害，并击飞 1 秒', type: 'aoe_cc' } },
  { id: 'hundun', name: '混沌', cost: 5, traits: ['幽都', '体修'], role: '前排',
    stats: { hp: 1100, atk: 70, atkSpeed: 0.6, armor: 60, mr: 50, mana: 40, manaMax: 115, range: 1 },
    skill: { name: '混沌吞噬', desc: '吞噬周围所有敌人 1.5 秒，造成 350 真实伤害', type: 'true_aoe' } },
  { id: 'zhuque', name: '朱雀·离焰', cost: 5, traits: ['妖庭', '符箓'], role: '主C',
    stats: { hp: 900, atk: 70, atkSpeed: 0.7, armor: 30, mr: 55, mana: 35, manaMax: 110, range: 4 },
    skill: { name: '离焰焚天', desc: '燃起离焰，对全体敌人造成 400 魔法伤害并灼烧 5 秒', type: 'aoe_burn' } },
  { id: 'yaodi', name: '妖帝', cost: 5, traits: ['幽都', '影杀'], role: '主C',
    stats: { hp: 900, atk: 72, atkSpeed: 0.8, armor: 35, mr: 35, mana: 0, manaMax: 60, range: 2 },
    skill: { name: '妖帝裁决', desc: '对血量最低的敌人造成 500 真实伤害，击杀则刷新技能', type: 'execute_true' } },
  { id: 'lingzun', name: '灵尊', cost: 5, traits: ['器灵', '驭兽'], role: '功能',
    stats: { hp: 950, atk: 65, atkSpeed: 0.65, armor: 45, mr: 50, mana: 35, manaMax: 105, range: 3 },
    skill: { name: '万灵朝宗', desc: '召唤 2 只灵兽助战，并使全体友军攻速 +40% 持续 5 秒', type: 'summon_buff' } }
]

/* ---------- 散件装备 ---------- */
export const BASE_ITEMS = [
  { id: 'xuantie', name: '玄铁精', icon: '铁', stat: '攻击 +15' },
  { id: 'lingyu', name: '灵鹊羽', icon: '羽', stat: '攻速 +15%' },
  { id: 'yusui', name: '千年玉髓', icon: '髓', stat: '法强 +20' },
  { id: 'youquan', name: '幽泉水', icon: '水', stat: '法力 +20' },
  { id: 'xuanjia', name: '玄龟甲', icon: '甲', stat: '护甲 +20' },
  { id: 'jiaoren', name: '鲛人绡', icon: '绡', stat: '魔抗 +20' },
  { id: 'lingmi', name: '灵米袋', icon: '米', stat: '生命 +150' },
  { id: 'chisha', name: '赤煞爪', icon: '爪', stat: '暴击 +15%' }
]

/* ---------- 成品装备（散件 + 散件） ---------- */
export const FULL_ITEMS = [
  { id: 'wujin', name: '无尽之刃', a: '玄铁精', b: '赤煞爪', desc: '暴击伤害 +40%，暴击率 +20%' },
  { id: 'jiying', name: '疾射火炮', a: '灵鹊羽', b: '灵鹊羽', desc: '攻速 +45%，射程 +1' },
  { id: 'miebian', name: '灭世法帽', a: '千年玉髓', b: '千年玉髓', desc: '法强 +45%' },
  { id: 'lanba', name: '蓝霸符', a: '幽泉水', b: '幽泉水', desc: '技能耗蓝 -15，释放后回复 20 法力' },
  { id: 'jijing', name: '荆棘之甲', a: '玄龟甲', b: '玄龟甲', desc: '护甲 +45，反弹 25% 物理伤害' },
  { id: 'longzhua', name: '巨龙之爪', a: '鲛人绡', b: '鲛人绡', desc: '魔抗 +45，每秒回复 2% 生命' },
  { id: 'kuangtu', name: '狂徒铠甲', a: '灵米袋', b: '灵米袋', desc: '生命 +400' },
  { id: 'guiyin', name: '鬼索之刃', a: '灵鹊羽', b: '玄铁精', desc: '每次普攻攻速 +5%，最多叠加 10 层' },
  { id: 'heka', name: '海克斯科技枪刃', a: '玄铁精', b: '千年玉髓', desc: '技能造成伤害的 25% 转化为治疗' },
  { id: 'shouhu', name: '守护天使', a: '玄龟甲', b: '灵米袋', desc: '死亡后复活，恢复 40% 生命（每局一次）' },
  { id: 'moreluo', name: '莫雷洛秘典', a: '千年玉髓', b: '幽泉水', desc: '技能附加灼烧，并降低 30% 治疗效果' },
  { id: 'datianti', name: '大天使之杖', a: '千年玉髓', b: '鲛人绡', desc: '每次释放技能法强 +10，最多 8 层' },
  { id: 'yinie', name: '饮血剑', a: '玄铁精', b: '鲛人绡', desc: '普攻回复 20% 伤害的生命' },
  { id: 'shixiang', name: '石像鬼板甲', a: '玄龟甲', b: '鲛人绡', desc: '每有一名敌人攻击自己，双抗 +8' },
  { id: 'jinghua', name: '窃贼手套', a: '赤煞爪', b: '幽泉水', desc: '开局随机获得一件临时成品装备' },
  { id: 'juren', name: '巨人杀手', a: '玄铁精', b: '玄铁精', desc: '对生命高于自己的敌人伤害 +35%' }
]

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
