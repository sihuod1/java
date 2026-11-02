import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' })
const { Game } = await server.ssrLoadModule('/src/data/gameEngine.js')

const g = new Game('召唤师')
// 两个相同散件：暴风大剑+暴风大剑 → 死亡之刃
g.player.baseItems = [{ id: '暴风大剑' }, { id: '暴风大剑' }]
const fi = g.combineTwoInBag(0, 1)
console.log('相同散件合成:', fi ? fi.name : 'null')

// 两个无法合成的：暴风大剑 + 金铲铲（其实金铲铲+暴风大剑=剑士徽章，能合成）
const g2 = new Game('召唤师')
g2.player.baseItems = [{ id: '暴风大剑' }, { id: '女神之泪' }]
const fi2 = g2.combineTwoInBag(0, 1)
console.log('暴风大剑+女神之泪:', fi2 ? fi2.name : 'null')
console.log('日志:', g2.logs)

// 成装之间：巨人杀手 + 死亡之刃（都是成装，无法合成）
const g3 = new Game('召唤师')
g3.player.baseItems = [{ id: '巨人杀手' }, { id: '死亡之刃' }]
const fi3 = g3.combineTwoInBag(0, 1)
console.log('成装+成装:', fi3 ? fi3.name : 'null')

await server.close()
