// ===== 后台管理员登录态管理 =====
// 与前台用户 token 完全隔离（独立存储键 + 后端独立校验）
import { API_BASE } from '../config'

const ADMIN_TOKEN_KEY = 'spatula_admin_token'
const ADMIN_USER_KEY = 'spatula_admin_user'

/** 取管理员 token */
export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

/** 保存管理员登录态 */
export function saveAdminLogin(token, user) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user || {}))
  } catch (e) {
    /* 存不上就算了 */
  }
}

/** 清除管理员登录态 */
export function clearAdminLogin() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
  } catch (e) {
    /* 忽略 */
  }
}

/** 是否已登录后台（只看本地有没有 token，真实有效性以后端 /api/admin/me 为准） */
export function isAdminLoggedIn() {
  return !!getAdminToken()
}

/** 取保存的管理员信息 */
export function getSavedAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || '{}')
  } catch (e) {
    return {}
  }
}

/**
 * 后台接口请求封装：自动带管理员 token
 * - 401：清登录态并跳后台登录页
 * - 其他非 0 code：把 message 抛给调用方
 */
export async function adminApi(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getAdminToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined
  })

  let json
  try {
    json = await res.json()
  } catch (e) {
    throw new Error('后端响应异常')
  }

  if (res.status === 401) {
    clearAdminLogin()
    if (!location.hash.startsWith('#/admin/login')) {
      location.hash = '#/admin/login'
    }
    throw new Error(json.message || '登录已过期，请重新登录')
  }
  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || `请求失败（${res.status}）`)
  }
  return json.data
}
