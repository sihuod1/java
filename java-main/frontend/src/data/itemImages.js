// 装备真实图标（金铲铲官方素材，96×96 PNG）
// 来源：腾讯金铲铲官网数据（game.gtimg.cn，时空裂痕 S4）+ CommunityDragon（守护天使）
// 官方对个别装备改过名，映射见 itemPhotoAliases
import item01 from '../assets/items/item_01.png'
import item02 from '../assets/items/item_02.png'
import item03 from '../assets/items/item_03.png'
import item04 from '../assets/items/item_04.png'
import item05 from '../assets/items/item_05.png'
import item06 from '../assets/items/item_06.png'
import item07 from '../assets/items/item_07.png'
import item08 from '../assets/items/item_08.png'
import item09 from '../assets/items/item_09.png'
import item10 from '../assets/items/item_10.png'
import item11 from '../assets/items/item_11.png'
import item12 from '../assets/items/item_12.png'
import item13 from '../assets/items/item_13.png'
import item14 from '../assets/items/item_14.png'
import item15 from '../assets/items/item_15.png'
import item16 from '../assets/items/item_16.png'
import item17 from '../assets/items/item_17.png'
import item18 from '../assets/items/item_18.png'
import item19 from '../assets/items/item_19.png'
import item20 from '../assets/items/item_20.png'
import item21 from '../assets/items/item_21.png'
import item22 from '../assets/items/item_22.png'
import item23 from '../assets/items/item_23.png'
import item24 from '../assets/items/item_24.png'
import item25 from '../assets/items/item_25.png'
import item26 from '../assets/items/item_26.png'
import item27 from '../assets/items/item_27.png'
import item28 from '../assets/items/item_28.png'

// 按装备名 → 图标
export const itemImages = {
  暴风大剑: item01,
  反曲之弓: item02,
  无用大棒: item03,
  女神之泪: item04,
  锁子甲: item05,
  负极斗篷: item06,
  巨人腰带: item07,
  拳套: item08,
  金铲铲: item09,
  死亡之刃: item10,
  疾射火炮: item11,
  灭世者的死亡之帽: item12,
  蓝霸符: item13,
  荆棘之甲: item14,
  龙爪: item15,
  狂徒铠甲: item16,
  窃贼手套: item17,
  巨人杀手: item18,
  海克斯科技枪刃: item19,
  守护天使: item20,
  饮血剑: item21,
  鬼索的狂暴之刃: item22,
  莫雷洛秘典: item23,
  石像鬼板甲: item24,
  大天使之杖: item25,
  剑士徽章: item26,
  游侠徽章: item27,
  法师徽章: item28,
}

// 官方改名对照（图鉴用旧名，金铲铲现版本用新名）：
// 拳套→拳击手套、死亡之刃→锐利之刃、灭世者的死亡之帽→班克斯的魔法帽、
// 窃贼手套→秘法手套、巨人杀手→巨人捕手、饮血剑→汲取剑、
// 石像鬼板甲→石像鬼石板甲、剑士/游侠/法师徽章→剑士/游侠/法师纹章

export function itemPhoto(name) {
  return itemImages[name] || null
}
