# AI 助手启动指南（写给 AI 编程助手看）

> **本文件是给 AI 助手（WorkBuddy/CodeBuddy 等）的操作手册。**
> 这台电脑每次开机都会重置（还原项目文件到旧快照），所以每次会话都按本指南执行。
> 用户说「启动项目」时，直接按本文档执行，**不要重新摸索**。

## ⚠️ 第〇步：重置恢复（最重要，每次开机后必做！）

**电脑重置 = Desktop 下的项目源码被还原到 2026-10-08 的旧快照**，所有增强代码（token 登录态、
主页、个人中心、首页 LandingView 等）会被抹掉！

**已验证能躲过重置的位置**：
- `C:\Users\Administrator\.workbuddy\`（含本备份）✅
- MySQL 数据目录（testuser01 等数据还在）✅
- Desktop 项目目录 ❌（会被还原）

**恢复命令（一条搞定）**⚠️ 解压根目录是 `Desktop/java-main/java-main`（**不是** `Desktop/java-main`，见坑 6）：
```bash
cd "C:/Users/Administrator/Desktop/java-main/java-main" && tar --force-local -xzf "C:/Users/Administrator/.workbuddy/project-backups/java-main-enhanced-20261012.tar.gz"
```
> 解压会覆盖 java-main / springBootTest 两个目录和 start-all.bat / stop-all.bat，
> 恢复出完整增强版源码（含 AI-STARTUP.md 本身）。
> **当前最新可用备份：`java-main-enhanced-20261012.tar.gz`（2026-10-12 生成并校验过，含 LandingView/ProfileView 等增强代码）。**

**恢复后如果又改了代码，记得重新打包备份**（⚠️ 同样先 cd 到 `Desktop/java-main/java-main`，日期自己改）：
```bash
cd "C:/Users/Administrator/Desktop/java-main/java-main" && tar --force-local --exclude='node_modules' --exclude='dist' --exclude='target' --exclude='log' --exclude='*.rar' --exclude='.vite' -czf "C:/Users/Administrator/.workbuddy/project-backups/java-main-enhanced-<日期>.tar.gz" java-main springBootTest start-all.bat stop-all.bat
```

**怎么判断项目是否被重置了**（不确定时检查）：
```bash
ls "C:/Users/Administrator/Desktop/java-main/java-main/java-main/frontend/src/views/"   # 有 LandingView/HomeView/ProfileView = 增强版还在；只有 Login/Register = 被重置了
```

## 一、项目概览

两个项目是同一个「金铲铲之战登录注册」工程的两个版本：

| 项目 | 说明 | 技术 | 端口 |
|---|---|---|---|
| `java-main/` | **新版（主力）**，前后端分离 | backend: SpringBoot 3.4.5 + MyBatis-Plus；frontend: Vue3 + Vite | 后端 **8081**，前端 **5173** |
| `springBootTest/` | 旧版，学习演示用（Thymeleaf 页面 + 硬编码密码 123） | SpringBoot 3.4.5 | **8082**（配置文件已固定） |

- 页面：`/` 首页（Landing，含登录态判断）→ `/login` 登录 → `/home` 主页（需登录）→ `/profile` 个人中心（需登录，改昵称/密码）
- 数据库共用：MySQL 8 本机 3306，账号 `root / 123456`，库名 `springboottest`
- 测试账号：`testuser01 / xyz789`（昵称：金铲铲大师；库若被重置则用注册接口重建）
- 旧版登录页：http://localhost:8082/user/to_login （任意账号，密码 123）

## 二、启动步骤（按顺序执行）

### 0. 环境检查
```bash
java -version 2>&1 | head -1; node -v; netstat -ano | grep -E ":(3306|8081|8082|5173)\s.*LISTENING"
```
- 需要：Java 21（Zulu，已在 PATH）、Node 22、MySQL 在 3306 监听
- MySQL 客户端：`C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe`
- MySQL 没起 → 让用户启动 MySQL 服务（AI 沙箱里 `sc` 被禁）

### 1. 检查数据库
```bash
"C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 -e "USE springboottest; SHOW TABLES;"
```
- 报 `Unknown database` 就执行建库：
```bash
"C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 < "C:/Users/Administrator/Desktop/java-main/java-main/java-main/backend/sql/init.sql"
```

### 2. 启动 java-main 后端（8081）⚠️ 关键坑见第三节
```bash
cd "C:/Users/Administrator/Desktop/java-main/java-main/java-main/backend" && env -u SERVER__PORT ./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```
（后台运行，等日志 `Tomcat started on port 8081`；首启 Maven 下载依赖 30-60 秒）

### 3. 启动 java-main 前端（5173）
```bash
cd "C:/Users/Administrator/Desktop/java-main/java-main/java-main/frontend" && npm run dev
```
- `node_modules` 不存在就先 `npm install`
- 成功标志：`VITE ready`，Local: http://localhost:5173/

### 4. 启动旧版 springBootTest（8082，用户要"两个项目"才启）⚠️ **必须在 8081 起来之后再启，见坑 5**
```bash
cd "C:/Users/Administrator/Desktop/java-main/java-main/springBootTest" && env -u SERVER__PORT ./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### 5. 验证
```bash
curl -s --noproxy "*" -o /dev/null -w "前端 %{http_code}\n" http://localhost:5173/
curl -s --noproxy "*" -o /dev/null -w "新后端 %{http_code}\n" http://localhost:8081/api/me   # 401 正常（没带 token）
curl -s --noproxy "*" -o /dev/null -w "旧后端 %{http_code}\n" http://localhost:8082/user/to_login
```
建库后 `sys_user` 是空表，补测试账号（已存在会返回 409，忽略即可）：
```bash
curl -s -X POST http://localhost:8081/api/register -H "Content-Type: application/json" -d '{"username":"testuser01","password":"xyz789"}'
```

## 三、关键坑（务必避开）

### ⚠️ 坑 1：SERVER__PORT 环境变量（每次都会遇到！）
AI 终端有沙箱注入的 `SERVER__PORT=54085`，Spring Boot 宽松绑定会把它当 `server.port`，
报「Port 54085 was already in use」（54085 是 WorkBuddy.exe 占的）。
**解法（已写进启动命令）**：`env -u SERVER__PORT`。仍冲突就加
`"-Dspring-boot.run.arguments=--server.port=8081"`。

### ⚠️ 坑 2：端口占用残留
启动前查 8081/8082/5173，被占先杀进程。

### ⚠️ 坑 3：curl 走代理
AI 终端有 http_proxy，curl localhost 可能 exit 23 但响应正常——看 stdout 内容判断，
或统一加 `--noproxy "*"`。

### ⚠️ 坑 4：电脑重置
见第〇步。**启动前先查 views/ 目录判断是否被重置**，被重置先恢复备份再启动，
否则跑起来的是没有登录态的旧代码。

### ⚠️ 坑 5：两个 Maven 项目不要同时启动（2026-10-12 实测踩到）
两个项目共用 `~/.m2` 本地仓库，同时跑 `mvnw spring-boot:run` 会争抢仓库里的
`.pom` / `.pom.lastUpdated` 文件，旧版直接 BUILD FAILURE：
`FileNotFoundException: ...mybatis-plus-extension-3.5.7.pom.lastUpdated (另一个程序正在使用此文件)`。
**解法**：**先启 java-main 后端（8081），等它打印 `Tomcat started on port 8081`、依赖下载完毕，
再启 springBootTest（8082）**（按顺序第二次跑就正常，不用清仓库）。
前端 npm 与 Maven 不冲突，可以和 8081 并行启动。

### ⚠️ 坑 6：实际目录层级比本文档正文多一层（重要）
本机实际路径是 `Desktop/java-main/java-main/java-main/backend`（**三段 java-main**），
`springBootTest` 在 `Desktop/java-main/java-main/springBootTest`。
正文若写成 `Desktop/java-main/java-main/backend` 是**错的**，`mvnw` 会因找不到项目而失败。
**执行前先 `ls` 确认实际存在的目录。**

## 四、停止服务
停掉三个后台任务即可（TaskStop / 杀 java/node 进程树）。MySQL 是系统服务，**不要动**。

## 五、给用户的一键脚本
- `Desktop/java-main/start-all.bat`：双击启动全部 3 个服务
- `Desktop/java-main/stop-all.bat`：双击停止
（电脑重置后这两个 bat 也会消失，用第〇步的备份恢复）

## 六、增强版功能清单（2026-10-09）
后端：TokenService（内存 token，7 天）、AuthInterceptor 拦截 /api/**（放行 login/register）、
GET /api/me、POST /api/logout、PUT /api/profile、PUT /api/password（改密码强制全部下线）、
登录返回 token、账号禁用校验。
前端：首页 LandingView（`/`，登录态判断显示不同按钮）、utils/auth.js（token 管理 + api 封装 +
401 统一处理）、路由守卫（requiresAuth + redirect 回跳）、HomeView 主页、ProfileView 个人中心、
记住我回填、登录成功跳 /home。
