# AI 助手启动指南（写给 AI 编程助手看）

> **本文件是给 AI 助手（WorkBuddy/CodeBuddy 等）的操作手册。**
> 用户说「启动项目」时，直接按本文档执行，**不要重新摸索**。
>
> 最后校正：**2026-10-23**（实际启动并验证通过）。

## 〇、项目实际位置（2026-10-23 核实）

| 项 | 实际值 |
|---|---|
| 项目根 | **`D:\workSpace\java\java-main`** |
| 旧路径 `Desktop/java-main/java-main` | **已不存在**（连 `Desktop/java-main` 目录都没有） |
| 旧 RAR 备份 `Desktop/java-main/java-main.rar` | **已不存在，无任何备份包** |
| `~/.workbuddy/project-backups/` | 不存在 |

> ⚠️ 历史版本的本文档描述「每次开机 Desktop 项目被还原、需用 RAR 恢复」。
> 该场景**已不成立**——项目已迁到 D 盘，Desktop 路径和 RAR 都已消失，第〇步的恢复命令已作废。
> 若确实被还原/丢失，本机**目前没有任何现成备份**，只能从 Git 远端或其他副本恢复。
> 建议尽快建一次备份（见第 6 节）。

## 一、项目概览

| 目录 | 说明 | 技术 | 端口 |
|---|---|---|---|
| `springBootTest/` | **后端（唯一）**，纯 REST 接口 `/api/*` | SpringBoot 3.4.5 + MyBatis-Plus 3.5.7 | **8081** |
| `frontend/` | **前端**，API 指向 8081 | Vue3 + Vite 5 + Vue Router（Hash） | **5173** |

- **不存在** `java-main/backend/` 目录，**不存在** 8082 旧版后端，**不要去找、不要再启 8082**。
- 页面：`/` 首页（Landing，登录态判断）→ `/login` 登录 → `/home` 主页（需登录）→ `/profile` 个人中心（需登录）
- **后台管理系统**：`/admin/login` 管理员登录（仅登录无注册）→ `/admin` 图鉴数据管理（英雄/装备/羁绊 CRUD，改完首页同步生效）。管理员 `admin / admin123`（**复用 `sys_user`，靠 `perm = 0` 区分**，不走注册）；普通权限账号看不到入口、也登不进
- 数据库：MySQL 8 本机 3306，账号 `root / 123456`，库名 `springboottest`
- 测试账号：`testuser01 / 123456`（2026-10-26 起密码改明文，历史账号统一重置为此值；库为空时用注册接口重建，见 2.4）
- ⚠️ `sys_user.password` **明文存储、不做加密**（用户明确要求），详见第十节
- ⚠️ Windows mysql 客户端导入含中文的 SQL **必须加 `--default-character-set=utf8mb4`**，否则报「Data too long」或中文乱码

## 二、启动步骤（按顺序执行）

### 2.0 环境检查
```bash
java -version 2>&1 | head -1; node -v; netstat -ano | grep -E ":(3306|8081|5173)\s.*LISTENING"
```
- 需要：Java 21（Zulu，已在 PATH）、Node 22、MySQL 在 3306 监听
- MySQL 客户端：`C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe`
- MySQL 没起 → 让用户启动 MySQL 服务（AI 沙箱里 `sc` 被禁）

### 2.1 检查数据库
```bash
"C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 -e "USE springboottest; SHOW TABLES;"
```
- 报 `Unknown database` 就建库（⚠️ `init.sql` 含 `DROP TABLE`，会清空 `sys_user`）：
```bash
cd "D:/workSpace/java/java-main/springBootTest" && "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 < sql/init.sql
```
- 库存在但缺图鉴/管理员表（`codex_hero`、`codex_item`、`codex_trait`、`sys_admin`），执行（⚠️ 同样含 DROP，会清空图鉴数据）：
```bash
cd "D:/workSpace/java/java-main/springBootTest"
MYSQL="C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe"
"$MYSQL" -u root -p123456 --default-character-set=utf8mb4 < sql/admin-init.sql
"$MYSQL" -u root -p123456 --default-character-set=utf8mb4 < sql/codex-seed.sql
```

### 2.2 启动后端（8081）⚠️ 必须带 `env -u SERVER__PORT`，见第三节坑 1
```bash
cd "D:/workSpace/java/java-main/springBootTest" && env -u SERVER__PORT ./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```
- 后台运行；首启 Maven 下载依赖约 1-2 分钟，已缓存后约 4 秒
- 成功标志：`Tomcat started on port 8081 (http)` + `Started SpringBootTestApplication`

### 2.3 启动前端（5173）
```bash
cd "D:/workSpace/java/java-main/frontend" && npm run dev
```
- `node_modules` 不存在就先 `npm install`（约 33 个包，30-40 秒）
- 成功标志：`VITE v5.x ready` + `Local: http://localhost:5173/`

### 2.4 验证
```bash
curl -s --noproxy "*" -o /dev/null -w "前端 %{http_code}\n" http://localhost:5173/      # 200
curl -s --noproxy "*" -o /dev/null -w "后端 %{http_code}\n" http://localhost:8081/api/me # 401 正常（未带 token）
```
补测试账号（已存在会报错，忽略即可）：
```bash
curl -s --noproxy "*" -X POST http://localhost:8081/api/register -H "Content-Type: application/json" -d '{"username":"testuser01","password":"123456"}'
curl -s --noproxy "*" -X POST http://localhost:8081/api/login    -H "Content-Type: application/json" -d '{"username":"testuser01","password":"123456"}'
# 期望登录取到 {"code":0,"data":{"token":"...","perm":1}}
```

## 三、关键坑（务必避开）

### ⚠️ 坑 1：SERVER__PORT 环境变量（每次都会遇到！）
AI 终端有沙箱注入的 `SERVER__PORT=54085`，Spring Boot 宽松绑定会把它当 `server.port`，
报「Port 54085 was already in use」（54085 是 WorkBuddy.exe 占的）。
**解法（已写进启动命令）**：`env -u SERVER__PORT`。仍冲突就加
`"-Dspring-boot.run.arguments=--server.port=8081"`。

### ⚠️ 坑 2：端口占用残留
启动前查 8081/5173，被占先杀进程（`stop-all.bat` 或 taskkill）。

### ⚠️ 坑 3：curl 走代理
AI 终端有 http_proxy，curl localhost 可能 exit 23 但响应正常——看 stdout 内容判断，
或统一加 `--noproxy "*"`。

### ⚠️ 坑 4：前端 `node_modules` 经常缺失
直接 `npm run dev` 会报 `vite 不是内部或外部命令`，先 `npm install`。

### ⚠️ 坑 5：路径别照抄旧文档
旧文档里的 `Desktop/java-main/java-main`、`java-main/backend`、8082 全都是过期信息。
执行前先 `ls "D:/workSpace/java/java-main"` 确认。

## 四、停止服务
停掉两个后台任务即可（TaskStop / 杀 java、node 进程）。MySQL 是系统服务，**不要动**。
- `stop-all.bat`：按端口 8081/5173 杀进程

## 五、给用户的一键脚本
- `start-all.bat`：双击启动后端 + 前端两个窗口
- `stop-all.bat`：双击停止
（两个脚本中的路径已校正为 `D:\workSpace\java\java-main`）

## 六、备份建议（本机当前无备份）
```bash
cd "D:/workSpace/java/java-main" && tar --force-local --exclude='node_modules' --exclude='dist' --exclude='target' --exclude='log' -czf "D:/workSpace/java/java-main-backup-$(date +%Y%m%d).tar.gz" frontend springBootTest start-all.bat stop-all.bat AI-STARTUP.md
```

## 七、增强版功能清单
后端：TokenService（内存 token，7 天）、AuthInterceptor 拦截 `/api/**`（放行 login/register）、
`GET /api/me`、`POST /api/logout`、`PUT /api/profile`、`PUT /api/password`（改密码强制全部下线）、
登录返回 token、账号禁用校验。
前端：LandingView（`/`）、utils/auth.js（token 管理 + api 封装 + 401 统一处理）、
路由守卫（requiresAuth + redirect 回跳）、HomeView、ProfileView、记住我回填、登录成功跳 `/home`。

## 八、后台管理系统（2026-10-23 新增）

用途：管理首页图鉴展示内容（英雄 / 装备 / 羁绊的增删改查），改动实时同步首页。

| 项 | 说明 |
|---|---|
| 入口 | 首页导航栏「后台管理」按钮 → `/#/admin/login` |
| 账号 | `admin / admin123`（复用 `sys_user`，`perm = 0` 即管理员；密码明文，不走注册） |
| 前端页面 | `AdminLoginView.vue`（仅登录）、`AdminView.vue`（三个 tab 表格 + 弹窗表单 CRUD） |
| token | 独立存储（`spatula_admin_token`，admin- 前缀），与前台用户 token 互不通用 |
| 鉴权 | `AdminInterceptor` 拦截 `/api/admin/**`（放行 `/api/admin/login`） |
| 公开接口 | `GET /api/codex/heroes\|items\|traits`（首页数据源，无需登录） |
| 管理接口 | `/api/admin/heroes\|items\|traits` 的 GET / POST / PUT / DELETE + login/me/logout |
| 数据表 | `codex_hero` / `codex_item` / `codex_trait`；管理员账号存在 `sys_user`（`perm = 0`），废弃的 `sys_admin` 不再参与登录校验 |
| 兜底 | 首页拉取 `/api/codex/*` 失败时回退 `codex.js` 静态数据，页面不空白 |
| 种子 | `sql/admin-init.sql`（建表）+ `sql/codex-seed.sql`（数据，由 codex.js 生成） |

⚠️ 已知坑：MySQL 列名 `desc` / `for` 是关键字，MyBatis-Plus 实体必须写
`@TableField("`desc`")`、`@TableField("`for`")`（带反引号），否则 SELECT 报 SQL 语法错误。

## 九、头像放大查看（2026-10-26 新增）

行为规则（用户明确要求）：

| 操作 | 结果 |
|---|---|
| 点任意一个头像 | 2K 立绘从头像位置 FLIP 放大，**宽 50vw、高度按原图比例**（原会拉伸成 50vw×100vh 竖条，已修） |
| 再点页面上任意一处 / 按 ESC | 原路缩回到头像位置并退出 |
| 点头像以外的卡片区域 | 仍然打开详情弹窗（两个交互互相独立） |

- 生效位置：`HomeView.vue` 的英雄卡 `.face`、详情弹窗里的 `.m-face`
- 实现：`openZoom / closeZoom / zoomBox`（FLIP + `phase: prepare|in|out`），悬停卡片时 `warmHero()` 预加载 2K 图
- **2K 素材**：`frontend/src/assets/heroes-splash-2k/`（2560×1440，23 张共 8.9 MB）
- ⚠️ Riot 公开素材上限只有 1280×720 / 1215×717（CommunityDragon、Data Dragon 都验证过），
  放大会发虚。**没有现成 2K 源**，只能本地重采样：
  ```bash
  "C:/Users/Administrator/.workbuddy/binaries/python/envs/default/Scripts/python.exe" scripts/upscale-splash-2k.py   # --force 强制重建
  ```
  （依赖 Pillow，装在 envs/default 虚拟环境里）
- `heroSplash()` 取值顺序：2K → 原画 → 小头像，缺图自动回退

## 十、用户权限字段与明文密码（2026-10-26 新增）

用户明确要求：**在 `sys_user` 新增权限字段；注册用户是默认权限；只有管理员权限才能在首页看到「后台管理系统」按钮并登录后台；密码明文存储，无需加密。**

| 项 | 说明 |
|---|---|
| 字段 | `sys_user.perm` TINYINT，`1` = 普通用户（默认权限），`0` = 管理员权限 |
| 注册 | `RegisterController → UserServiceImpl.register()` 固定写入 `perm = 1` |
| 密码 | `sys_user.password` **明文存储与比对**，已移除 `BCryptPasswordEncoder` |
| 后台登录 | `AdminController` 改查 `sys_user`：密码校验通过后再查权限，非管理员直接 **403「该账号不是管理员，无权进入后台管理系统」** |
| 权限回传 | `/api/login` 与 `/api/me` 都返回 `perm`（`LoginResult` / `MeResult`） |
| 前端入口 | `HomeView.vue` 的「后台管理」按钮 `v-if="isAdmin"`，`perm = 1` 时根本不渲染 |
| 路由守卫 | `/admin/login` 与 `/admin` 都带 `meta.requiresAdminPerm`，非管理员直接跳回 `/home` |
| 迁移脚本 | `springBootTest/sql/perm-init.sql`（幂等；预置管理员 `admin / admin123`，`perm = 0`） |

```bash
cd "D:/workSpace/java/java-main/springBootTest" && "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 < sql/perm-init.sql
```

⚠️ 注意事项：
- **BCrypt 不可逆**：迁移会把历史摘要（`$2a$` 开头）统一重置为 `123456`，原密码无法还原，需告知用户改密码。
- 废弃的 `sys_admin` 表已不参与任何登录校验，`Admin.java` / `AdminMapper.java` 成为无用代码（保留不影响编译，可安全删除）。
- 权限是在**登录时**缓存到本地的：某账号在数据库里被改成管理员后，必须**重新登录**才能看到后台入口。
- ⚠️ 明文密码仅供本地演示：一旦该服务暴露到公网或多人共用，务必改回哈希（BCrypt/Argon2）存储。
