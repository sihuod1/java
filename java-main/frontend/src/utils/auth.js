// ===== 登录态管理 =====
// token 存 localStorage，请求统一从这里走，自动带 Authorization 头
import { API_BASE } from '../config'

const TOKEN_KEY = 'spatula_token'
const USER_KEY = 'spatula_user'

/** 取 token */
export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch (e) { return '' }
}

/** 登录成功后保存登录态 */
export function saveLogin(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}))
  } catch (e) { /* 隐私模式等场景存不上就算了 */ }
}

/** 清除登录态（退出登录 / token 失效时调用） */
export function clearLogin() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (e) {}
}

/** 是否已登录（只看本地有没有 token，真实有效性以后端 /api/me 为准） */
export function isLoggedIn() {
  return !!getToken()
}

/** 取登录时缓存的用户信息（仅做展示兜底，权威数据以 /api/me 为准） */
export function getSavedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}') } catch (e) { return {} }
}

/**
 * 统一请求封装：
 * - 自动拼接 API_BASE 和 Authorization 头
 * - 返回后端统一结构 {code, message, data}，code=0 时返回 data
 * - 401（未登录/过期）自动清除登录态并跳回登录页
 *
 * @param {string} path    接口路径，如 '/api/me'
 * @param {object} options fetch 配置（method、body 等）
 * @returns {Promise<any>} 成功时的 data
 */
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const result = await res.json().catch(() => ({}))

  // 登录态失效：清掉本地缓存，回登录页
  if (res.status === 401) {
    clearLogin()
    if (!location.hash.startsWith('#/login')) {
      location.hash = '#/login'
    }
    throw new Error(result.message || '登录已过期，请重新登录')
  }

  if (!res.ok || result.code !== 0) {
    throw new Error(result.message || `请求失败（HTTP ${res.status}）`)
  }
  return result.data
}
