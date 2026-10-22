import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  // 首页（门面页，登录与否都可见）
  { path: '/', name: 'landing', component: LandingView, meta: { title: '首页' } },
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
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { title: '主页', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: '个人中心', requiresAuth: true }
  },
  // 兜底：未知地址回到首页
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  // 用 hash 模式：直接双击 index.html 或部署到任意静态目录都能正常跳转
  history: createWebHashHistory(),
  routes
})

// 路由守卫：需要登录的页面（meta.requiresAuth）没登录就去登录页
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

// 跟着路由切换浏览器标题
router.afterEach((to) => {
  document.title = `金铲铲之战 · ${to.meta.title || '首页'}`
})

export default router
