// ============================================================
// 英雄头像资源映射（中文名 -> 本地 PNG）
// ------------------------------------------------------------
// 图片来源：Riot Data Dragon（cdn 16.21.1），已下载到本地
// src/assets/heroes/，按英文名去掉了空格和撇号作为文件名。
// 新增英雄时：放一张 <EnName>.png 进 assets/heroes 再在这里加一行。
// ============================================================

const images = import.meta.glob('../assets/heroes/*.png', {
  eager: true,
  import: 'default'
})

// 高清立绘（Riot centered splash 1280x720 / splash 1215x717），放大展示用
const splashes = import.meta.glob('../assets/heroes-splash/*.jpg', {
  eager: true,
  import: 'default'
})

// 英文名 -> 已解析的图片 URL
const byEn = {}
for (const [path, url] of Object.entries(images)) {
  const file = path.split('/').pop().replace(/\.png$/, '')
  byEn[file.toLowerCase()] = url
}
const splashByEn = {}
for (const [path, url] of Object.entries(splashes)) {
  const file = path.split('/').pop().replace(/\.jpg$/, '')
  splashByEn[file.toLowerCase()] = url
}

// 中文名 -> 图片 URL（en 字段与文件名对应规则：去空格、去撇号）
export const HERO_AVATARS = {
  盖伦: byEn['garen'],
  薇恩: byEn['vayne'],
  格雷福斯: byEn['graves'],
  卡萨丁: byEn['kassadin'],
  奥恩: byEn['ornn'],
  艾希: byEn['ashe'],
  布隆: byEn['braum'],
  璐璐: byEn['lulu'],
  慎: byEn['shen'],
  千珏: byEn['kindred'],
  锐雯: byEn['riven'],
  努努: byEn['nunu'],
  卡尔玛: byEn['karma'],
  阿卡丽: byEn['akali'],
  维克兹: byEn['velkoz'],
  亚索: byEn['yasuo'],
  烬: byEn['jhin'],
  奥拉夫: byEn['olaf'],
  艾尼维亚: byEn['anivia'],
  凯隐: byEn['kayn'],
  厄加特: byEn['urgot'],
  李青: byEn['leesin'],
  悠米: byEn['yuumi']
}

// 取头像：有图返回图片 URL，没图返回 null（调用方回退到文字首字）
export function heroAvatar(name) {
  return HERO_AVATARS[name] || null
}

// 取高清立绘（放大展示用），没有则回退到小头像
export function heroSplash(name) {
  const enMap = {
    盖伦: 'garen', 薇恩: 'vayne', 格雷福斯: 'graves', 卡萨丁: 'kassadin',
    奥恩: 'ornn', 艾希: 'ashe', 布隆: 'braum', 璐璐: 'lulu', 慎: 'shen',
    千珏: 'kindred', 锐雯: 'riven', 努努: 'nunu', 卡尔玛: 'karma',
    阿卡丽: 'akali', 维克兹: 'velkoz', 亚索: 'yasuo', 烬: 'jhin',
    奥拉夫: 'olaf', 艾尼维亚: 'anivia', 凯隐: 'kayn', 厄加特: 'urgot',
    李青: 'leesin', 悠米: 'yuumi'
  }
  return splashByEn[enMap[name]] || HERO_AVATARS[name] || null
}
