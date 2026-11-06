// ===== 好友 + 组队房间 API 封装 =====
// 复用 utils/auth.js 的 api()，统一走 token 鉴权与错误处理
import { api } from './auth'

/** 我的好友列表 */
export function listFriends() {
  return api('/api/friends')
}

/** 添加好友（按账号） */
export function addFriend(username) {
  return api('/api/friends', {
    method: 'POST',
    body: JSON.stringify({ username })
  })
}

/** 删除好友 */
export function removeFriend(id) {
  return api(`/api/friends/${id}`, { method: 'DELETE' })
}

/** 搜索用户（按账号/昵称） */
export function searchUsers(kw) {
  return api(`/api/users/search?kw=${encodeURIComponent(kw)}`)
}

/** 创建房间 */
export function createRoom() {
  return api('/api/rooms', { method: 'POST' })
}

/** 加入房间（凭邀请码） */
export function joinRoom(code) {
  return api('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}

/** 查询房间详情 */
export function roomDetail(code) {
  return api(`/api/rooms/${encodeURIComponent(code)}`)
}

/** 我当前所在的房间 */
export function myRoom() {
  return api('/api/rooms/mine')
}

/** 房主开始游戏 */
export function startRoom(code) {
  return api(`/api/rooms/${encodeURIComponent(code)}/start`, { method: 'POST' })
}

/** 退出房间 */
export function leaveRoom(code) {
  return api(`/api/rooms/${encodeURIComponent(code)}/leave`, { method: 'POST' })
}
