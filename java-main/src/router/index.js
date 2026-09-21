import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  // 默认进入登录页
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: '注册' }
  },
  // 兜底：未知地址回到登录页
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  // 用 hash 模式：直接双击 index.html 或部署到任意静态目录都能正常跳转
  history: createWebHashHistory(),
  routes
})

// 跟着路由切换浏览器标题
router.afterEach((to) => {
  document.title = `金铲铲之战 · ${to.meta.title || '登录'}`
})

export default router
