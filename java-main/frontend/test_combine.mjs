import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' })
const { Game } = await server.ssrLoadModule('/src/data/gameEngine.js')
const { BASE_ITEMS, FULL_ITEMS } = await server.ssrLoadModule('/src/data/gameData.js')

console.log('BASE_ITEMS 数量:', BASE_ITEMS.length)
console.log('BASE_ITEMS[0]:', BASE_ITEMS[0])
console.log('FULL_ITEMS 数量:', FULL_ITEMS.length)
console.log('FULL_ITEMS[0]:', FULL_ITEMS[0])
console.log('FULL_ITEMS[8] (巨人杀手):', FULL_ITEMS[8])

const g = new Game('召唤师')
// 手动放两个能合成的散件：暴风大剑 + 反曲之弓 → 巨人杀手
g.player.baseItems = [{ id: '暴风大剑' }, { id: '反曲之弓' }]
console.log('\n合成前背包:', g.player.baseItems)

const fi = g.combineTwoInBag(0, 1)
console.log('合成结果 fi:', fi ? fi.name : 'null')
console.log('合成后背包:', g.player.baseItems)
console.log('日志:', g.logs)

await server.close()
