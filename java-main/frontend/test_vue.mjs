import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' })
const { reactive } = await server.ssrLoadModule('vue')

// 模拟引擎数组和 Vue reactive 的引用关系
const enginePlayer = { baseItems: [{ id: 'A' }, { id: 'B' }] }
const vueState = reactive({ baseItems: enginePlayer.baseItems })

// 记录渲染次数
let renderCount = 0
// 用 effect 模拟模板依赖
const { effect } = await server.ssrLoadModule('vue')
effect(() => {
  vueState.baseItems.length  // 依赖 baseItems.length
  renderCount++
})
console.log('初始 renderCount:', renderCount)

// 模拟 combineTwoInBag 的 splice 操作（直接操作引擎原始数组）
enginePlayer.baseItems.splice(1, 1)
enginePlayer.baseItems.splice(0, 1)
enginePlayer.baseItems.push({ id: 'C' })
console.log('splice后 renderCount:', renderCount, '(应该>初始)')

// 模拟 syncPlayer 的同引用赋值
vueState.baseItems = enginePlayer.baseItems
console.log('syncPlayer后 renderCount:', renderCount)

await server.close()
