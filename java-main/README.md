# 金铲铲之战 · 登录注册（Vue3 + SpringBoot3 + MyBatis-Plus + MySQL）

把前端 Vue 页面和后端 SpringBoot 接口打通的示例工程。

- 前端：Vue 3 + Vue Router（Hash 模式），登录 / 注册两个页面
- 后端：SpringBoot 3.4.5 + MyBatis-Plus + MySQL 8，端口 **8081**
- 数据库：本地 MySQL，`root / 123456`，库名 `springboottest`
- 密码：使用 **BCrypt** 加密存储，不落明文
- 跨域：后端已开启 CORS，允许前端（默认 5173）直接调用

---

## 目录结构

```
java-main/
├── backend/                # SpringBoot 后端（用 IDEA 打开这个目录）
│   ├── pom.xml
│   ├── sql/init.sql        # 建库建表脚本
│   └── src/main/...
├── frontend/               # Vue3 前端（npm 项目）
│   ├── package.json
│   ├── vite.config.js
│   └── src/...
└── README.md
```

---

## 一、后端启动

### 1. 建库建表
在本地 MySQL 中执行 `backend/sql/init.sql`（会创建 `springboottest` 库和 `sys_user` 表）：
```bash
mysql -u root -p < backend/sql/init.sql
```
> 也可以直接在 Navicat / IDEA Database 里打开该文件执行。

### 2. 确认数据库连接配置
打开 `backend/src/main/resources/application-dev.properties`，默认已配好：
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/springboottest?...&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
```
> 如果你的 MySQL 端口不是 3306、密码不是 123456，改这里即可。

### 3. 启动后端
- **方式 A（IDEA）**：用 IDEA 打开 `backend/` 目录 → 等待 Maven 依赖下载完成 → 运行 `SpringBootTestApplication.java` 的 main 方法。
- **方式 B（Maven）**：在 `backend/` 目录下执行
  ```bash
  mvn spring-boot:run
  ```
  （或用项目自带的 `mvnw`：`mvnw spring-boot:run`）

启动成功后控制台出现 `Started SpringBootTestApplication` 即表示 OK。

---

## 二、前端启动

```bash
cd frontend
npm install
npm run dev
```
默认地址 http://localhost:5173 ，浏览器打开后自动跳到 `#/login`。

> 前端通过 `src/config.js` 里的 `API_BASE` 指向后端（`http://localhost:8081`）。
> 后端端口变化时，只改这一个常量即可，无需改动各页面。

---

## 三、接口契约

所有接口返回统一结构：`{ "code": 0, "message": "...", "data": ... }`，**code=0 表示成功**。

### 注册  `POST /api/register`
请求体：
```json
{ "username": "test01", "password": "123456" }
```
- 成功：`200`，`{ "code": 0, "message": "注册成功" }`
- 账号已存在：`409`，`{ "code": 1, "message": "该账号已被注册，换一个吧～" }`
- 参数不合法（账号<4位 / 密码<6位 / 为空）：`400`

> 注册的“图形验证码”是前端 Canvas 生成并在前端校验的，校验通过后才把账号密码发给后端。

### 登录  `POST /api/login`
请求体：
```json
{ "username": "test01", "password": "123456" }
```
- 成功：`200`，`{ "code": 0, "data": { "username": "test01", "nickName": "test01" } }`
- 账号或密码错误：`401`，`{ "code": 1, "message": "账号或密码错误" }`
- 参数为空：`400`

---

## 四、常见问题

1. **前端点登录/注册提示“连不上服务器”**
   确认后端已在 8081 启动；或检查 `frontend/src/config.js` 的 `API_BASE` 是否和后端地址一致。
2. **后端启动报 SQL / 连接失败**
   检查 MySQL 是否运行、`springboottest` 库和 `sys_user` 表是否建好、账号密码是否正确。
3. **CORS 跨域报错**
   后端 `config/CorsConfig.java` 已放开所有来源；如仍报错，检查前端是否真的请求到了 `http://localhost:8081`。

---

## 技术要点速览
- `UserController` 之类的 Thymeleaf 服务端页面已移除，现在是纯 REST 接口（`/api/*`）。
- 密码用 `spring-security-crypto` 的 `BCryptPasswordEncoder` 加密，登录用 `matches` 比对。
- 统一返回 `Result<T>` + 全局异常 `GlobalExceptionHandler`，业务异常 `BizException` 自动映射成正确的 HTTP 状态码（400/401/409）。
- MyBatis-Plus 负责 `sys_user` 表的增删改查与分页插件。
