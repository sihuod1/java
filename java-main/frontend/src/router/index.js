import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'
import { isAdminLoggedIn } from '../utils/adminAuth'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminView from '../views/AdminView.vue'

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
  // 后台管理系统：登录页（仅登录，无注册入口）
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: AdminLoginView,
    meta: { title: '后台登录' }
  },
  // 后台管理系统：图鉴数据管理（需管理员登录态）
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { title: '后台管理', requiresAdmin: true }
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
  // 后台页面：没有管理员登录态就去后台登录页
  if (to.meta.requiresAdmin && !isAdminLoggedIn()) {
    return { name: 'adminLogin' }
  }
})

// 跟着路由切换浏览器标题
router.afterEach((to) => {
  document.title = `金铲铲之战 · ${to.meta.title || '首页'}`
})

export default router
