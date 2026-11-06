<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSavedUser, api } from '../utils/auth'
import {
  listFriends, addFriend, removeFriend, searchUsers,
  createRoom, joinRoom, myRoom, startRoom, leaveRoom, roomDetail
} from '../utils/social'

const router = useRouter()
const savedUser = getSavedUser()
const myName = savedUser.nickName || savedUser.username || '召唤师'

/* ---------------- 好友 ---------------- */
const friends = ref([])
const searchKw = ref('')
const searchResult = ref([])
const searching = ref(false)
const friendTip = ref('')   // 添加/删除提示
const tab = ref('friends')  // friends | search

let friendTipTimer = null
function flashTip(msg, ok = true) {
  friendTip.value = { msg, ok }
  if (friendTipTimer) clearTimeout(friendTipTimer)
  friendTipTimer = setTimeout(() => { friendTip.value = '' }, 2600)
}

async function loadFriends() {
  try { friends.value = await listFriends() } catch (e) { /* 忽略 */ }
}

async function onAddFriend(username) {
  if (!username || !username.trim()) return
  try {
    const f = await addFriend(username.trim())
    flashTip(`已添加好友「${f.nickName}」`)
    await loadFriends()
    searchResult.value = searchResult.value.map(u =>
      u.username === f.username ? { ...u, isFriend: true } : u)
  } catch (e) {
    flashTip(e.message || '添加失败', false)
  }
}

async function onRemoveFriend(f) {
  try {
    await removeFriend(f.id)
    flashTip(`已删除好友「${f.nickName}」`)
    await loadFriends()
  } catch (e) {
    flashTip(e.message || '删除失败', false)
  }
}

async function onSearch() {
  const kw = searchKw.value.trim()
  if (!kw) { searchResult.value = []; return }
  searching.value = true
  try {
    searchResult.value = await searchUsers(kw)
  } catch (e) {
    flashTip(e.message || '搜索失败', false)
  } finally {
    searching.value = false
  }
}

/* ---------------- 房间 ---------------- */
const room = ref(null)        // 当前房间 { code, hostName, members: [...] }
const roomCodeInput = ref('')
const roomTip = ref('')
const myId = ref(null)        // 当前用户 id（用于判断是否房主）

let roomTimer = null

async function refreshMyId() {
  try {
    const me = await api('/api/me')
    myId.value = me.id
  } catch (e) { /* 忽略 */ }
}

async function onCreateRoom() {
  try {
    room.value = await createRoom()
    await refreshMyId()
    flashTip(`房间创建成功，邀请码 ${room.value.code}`)
  } catch (e) {
    flashTip(e.message || '创建失败', false)
  }
}

async function onJoinRoom() {
  const code = roomCodeInput.value.trim().toUpperCase()
  if (!code) return
  try {
    room.value = await joinRoom(code)
    await refreshMyId()
    flashTip('加入房间成功')
  } catch (e) {
    flashTip(e.message || '加入失败', false)
  }
}

async function onStartRoom() {
  if (!room.value) return
  try {
    room.value = await startRoom(room.value.code)
    // 开始游戏：跳转到游戏页（本演示为本地自走棋）
    router.push({ name: 'game' })
  } catch (e) {
    flashTip(e.message || '开始失败', false)
  }
}

async function onLeaveRoom() {
  if (!room.value) return
  const code = room.value.code
  try {
    await leaveRoom(code)
    room.value = null
    flashTip('已退出房间')
  } catch (e) {
    flashTip(e.message || '退出失败', false)
  }
}

async function copyCode() {
  if (!room.value) return
  try {
    await navigator.clipboard.writeText(room.value.code)
    flashTip('邀请码已复制，发给好友吧')
  } catch (e) {
    // 剪贴板 API 可能不可用，回退为提示
    flashTip(`邀请码：${room.value.code}，请手动复制`)
  }
}

/** 轮询房间状态，让成员实时看到新加入的人 */
async function pollRoom() {
  if (!room.value) return
  try {
    room.value = await roomDetail(room.value.code)
  } catch (e) {
    // 房间可能已被房主解散
    room.value = null
  }
}

onMounted(async () => {
  await loadFriends()
  await refreshMyId()
  // 尝试恢复我所在的房间
  try {
    const mine = await myRoom()
    if (mine) room.value = mine
  } catch (e) { /* 忽略 */ }
  roomTimer = setInterval(pollRoom, 3000)
})

onUnmounted(() => {
  if (roomTimer) clearInterval(roomTimer)
})

function goHome() { router.push({ name: 'home' }) }
function goGame() { router.push({ name: 'game' }) }

/** 是否房主（按当前用户 id 与房间 hostId 比对） */
const isHost = computed(() => room.value && room.value.hostId === myId.value)
const memberCount = computed(() => room.value ? room.value.members.length : 0)
</script>

<template>
  <div class="lobby">
    <!-- 顶栏 -->
    <header class="lobby-top">
      <button class="back" @click="goHome">‹ 返回首页</button>
      <h1 class="title">开黑大厅</h1>
      <span class="me">召唤师 <b>{{ myName }}</b></span>
    </header>

    <!-- 提示条 -->
    <transition name="fade">
      <div v-if="friendTip" class="tip" :class="{ err: !friendTip.ok }">{{ friendTip.msg }}</div>
    </transition>

    <div class="lobby-grid">
      <!-- ===== 左：好友列表 ===== -->
      <section class="card friends-card">
        <div class="card-head">
          <h2>我的好友 <i>{{ friends.length }}</i></h2>
          <button class="btn-sub" @click="tab = 'search'">＋ 添加好友</button>
        </div>

        <!-- 搜索添加 -->
        <div v-if="tab === 'search'" class="search-box">
          <div class="search-row">
            <input
              v-model="searchKw"
              class="input"
              type="text"
              placeholder="输入对方账号 / 昵称"
              @keyup.enter="onSearch"
            />
            <button class="btn-main" @click="onSearch" :disabled="searching">
              {{ searching ? '搜索中…' : '搜索' }}
            </button>
          </div>
          <div v-if="searchResult.length" class="search-result">
            <div v-for="u in searchResult" :key="u.id" class="user-row">
              <span class="u-face">{{ (u.nickName || u.username)[0] }}</span>
              <span class="u-name">{{ u.nickName }}</span>
              <span class="u-sub">@{{ u.username }}</span>
              <button
                v-if="!u.isFriend"
                class="btn-add"
                @click="onAddFriend(u.username)"
              >添加</button>
              <span v-else class="u-added">已是好友</span>
            </div>
          </div>
          <p v-else-if="searchKw && !searching" class="empty">没有匹配的用户</p>
          <button class="btn-link" @click="tab = 'friends'">← 返回好友列表</button>
        </div>

        <!-- 好友列表 -->
        <template v-else>
          <div v-if="friends.length" class="friend-list">
            <div v-for="f in friends" :key="f.id" class="user-row">
              <span class="u-face">{{ f.nickName[0] }}</span>
              <span class="u-name">{{ f.nickName }}</span>
              <span class="u-sub">@{{ f.username }}</span>
              <button class="btn-remove" @click="onRemoveFriend(f)">删除</button>
            </div>
          </div>
          <p v-else class="empty">还没有好友，点右上角「添加好友」吧</p>
        </template>
      </section>

      <!-- ===== 右：组队房间 ===== -->
      <section class="card room-card">
        <div class="card-head">
          <h2>组队开黑</h2>
        </div>

        <!-- 无房间：创建 / 加入 -->
        <div v-if="!room" class="room-none">
          <p class="room-desc">创建房间邀请好友，或输入好友的邀请码加入</p>
          <button class="btn-main big" @click="onCreateRoom">＋ 创建房间</button>
          <div class="divider">或</div>
          <div class="join-row">
            <input
              v-model="roomCodeInput"
              class="input code-input"
              type="text"
              maxlength="6"
              placeholder="输入 6 位邀请码"
              @keyup.enter="onJoinRoom"
            />
            <button class="btn-sub" @click="onJoinRoom">加入</button>
          </div>
        </div>

        <!-- 已有房间 -->
        <div v-else class="room-live">
          <div class="room-code-box">
            <span class="room-code-label">房间邀请码</span>
            <span class="room-code">{{ room.code }}</span>
            <button class="btn-link" @click="copyCode">复制邀请码</button>
          </div>

          <div class="room-members">
            <div class="room-members-title">
              队伍成员（{{ memberCount }}/8）
              <span v-if="isHost" class="host-tag">你是房主</span>
            </div>
            <div class="member-grid">
              <div
                v-for="m in room.members"
                :key="m.id"
                class="member"
                :class="{ host: m.isHost }"
              >
                <span class="u-face">{{ m.nickName[0] }}</span>
                <span class="u-name">{{ m.nickName }}</span>
                <span v-if="m.isHost" class="host-badge">房主</span>
                <span v-else class="member-badge">队员</span>
              </div>
              <div
                v-for="i in 8 - room.members.length"
                :key="'e' + i"
                class="member empty"
              >
                <span class="u-face">?</span>
                <span class="u-name">等待加入</span>
              </div>
            </div>
          </div>

          <p class="room-waiting" v-if="!room.started">
            等待好友加入…（满员可开战，也可 2 人即开）
          </p>

          <div class="room-actions">
            <button v-if="isHost" class="btn-main big" @click="onStartRoom">
              ⚔ 开始游戏
            </button>
            <button v-else class="btn-wait big" disabled>
              等待房主开始…
            </button>
            <button class="btn-remove" @click="onLeaveRoom">退出房间</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  width: min(1080px, 94vw);
  margin: 0 auto;
  padding: 18px 0 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 顶栏 */
.lobby-top {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(247, 215, 116, 0.22);
  background: rgba(16, 19, 42, 0.72);
  backdrop-filter: blur(10px);
}
.back {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e6e2d6;
  padding: 7px 14px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}
.back:hover { border-color: var(--gold-1, #e0a93b); }
.title {
  flex: 1;
  font-size: 20px;
  letter-spacing: 3px;
  color: var(--gold-1, #e0a93b);
  margin: 0;
}
.me { font-size: 13px; color: var(--muted, #8f98a6); }
.me b { color: var(--gold-1, #e0a93b); }

/* 提示条 */
.tip {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 14px;
  color: #6fc9a4;
  background: rgba(111, 201, 164, 0.12);
  border: 1px solid rgba(111, 201, 164, 0.35);
}
.tip.err {
  color: #ff8f8f;
  background: rgba(255, 143, 143, 0.12);
  border-color: rgba(255, 143, 143, 0.35);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 布局 */
.lobby-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 820px) {
  .lobby-grid { grid-template-columns: 1fr; }
}

.card {
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(247, 215, 116, 0.2);
  background: linear-gradient(180deg, rgba(30, 34, 66, 0.85), rgba(16, 19, 42, 0.9));
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card-head h2 {
  margin: 0;
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--gold-1, #e0a93b);
}
.card-head h2 i {
  font-style: normal;
  margin-left: 6px;
  font-size: 13px;
  color: var(--muted, #8f98a6);
}

/* 输入与按钮 */
.input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #f4efe2;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.input:focus { border-color: var(--gold-1, #e0a93b); }
.input::placeholder { color: #6f6c8c; }

.btn-main {
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  color: #3a2a06;
  background: linear-gradient(180deg, var(--gold-1, #e0a93b), var(--gold-3, #b87a1e));
  transition: filter 0.2s;
}
.btn-main:hover { filter: brightness(1.08); }
.btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-main.big { padding: 13px 28px; font-size: 15px; }

.btn-sub {
  border: 1px solid rgba(247, 215, 116, 0.45);
  background: transparent;
  color: var(--gold-1, #e0a93b);
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}
.btn-sub:hover { background: rgba(247, 215, 116, 0.1); }

.btn-link {
  background: transparent;
  border: none;
  color: var(--gold-1, #e0a93b);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  padding: 4px 0;
}
.btn-link:hover { text-decoration: underline; }

/* 搜索 */
.search-box { display: flex; flex-direction: column; gap: 12px; }
.search-row { display: flex; gap: 10px; }
.search-result, .friend-list { display: flex; flex-direction: column; gap: 8px; }

.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.u-face {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #3a2a06;
  background: linear-gradient(180deg, #e8c87a, #c09a4a);
}
.u-name { font-weight: 700; color: #f4efe2; }
.u-sub { font-size: 12px; color: var(--muted, #8f98a6); flex: 1; }

.btn-add {
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #3a2a06;
  background: linear-gradient(180deg, #6fc9a4, #4aa888);
}
.btn-add:hover { filter: brightness(1.06); }
.btn-remove {
  border: 1px solid rgba(255, 143, 143, 0.4);
  background: transparent;
  color: #ff8f8f;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}
.btn-remove:hover { background: rgba(255, 143, 143, 0.1); }
.u-added { font-size: 13px; color: #6fc9a4; }

.empty {
  color: var(--muted, #8f98a6);
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

/* 房间 */
.room-none { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }
.room-desc { color: var(--muted, #8f98a6); font-size: 13px; margin: 0; }
.divider {
  text-align: center;
  color: #6f6c8c;
  font-size: 12px;
  position: relative;
}
.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}
.divider::before { left: 0; }
.divider::after { right: 0; }
.join-row { display: flex; gap: 10px; }
.code-input { text-transform: uppercase; letter-spacing: 3px; font-size: 18px; }

/* 房间已创建 */
.room-live { display: flex; flex-direction: column; gap: 18px; }
.room-code-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(247, 215, 116, 0.08);
  border: 1px dashed rgba(247, 215, 116, 0.45);
}
.room-code-label { font-size: 13px; color: var(--muted, #8f98a6); }
.room-code {
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 8px;
  color: var(--gold-1, #e0a93b);
  text-shadow: 0 0 20px rgba(247, 215, 116, 0.4);
}

.room-members-title {
  font-size: 14px;
  color: var(--muted, #8f98a6);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.host-tag {
  font-size: 12px;
  color: #6fc9a4;
  border: 1px solid rgba(111, 201, 164, 0.4);
  border-radius: 6px;
  padding: 2px 8px;
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.member.host { border-color: rgba(111, 201, 164, 0.5); }
.member.empty { opacity: 0.5; border-style: dashed; }
.member .u-name { font-size: 13px; text-align: center; }
.host-badge { font-size: 11px; color: #6fc9a4; }
.member-badge { font-size: 11px; color: var(--muted, #8f98a6); }

.room-waiting { color: var(--muted, #8f98a6); font-size: 13px; margin: 0; }
.room-actions { display: flex; gap: 12px; align-items: center; }
.btn-wait {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: #6f6c8c;
  border-radius: 10px;
  padding: 13px 28px;
  font-family: inherit;
  font-size: 15px;
}
</style>
