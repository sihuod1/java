-- ============================================================
-- 用户表权限字段迁移 + 密码改为明文存储
-- 数据库：springboottest     MySQL 8.0
-- 执行方式：
--   mysql -u root -p < sql/perm-init.sql
-- ============================================================

USE `springboottest`;

-- 1. 新增权限字段
--    perm = 1 -> 普通用户（默认权限，注册用户即此值）
--    perm = 0 -> 管理员权限（可登录后台管理系统）
ALTER TABLE `sys_user`
  ADD COLUMN `perm` TINYINT NOT NULL DEFAULT 1 COMMENT '权限：1-普通用户（默认） 0-管理员' AFTER `status`;

-- 2. 密码列调整为明文存储（原注释为 BCrypt 加密，此处同步订正）
ALTER TABLE `sys_user`
  MODIFY COLUMN `password` VARCHAR(100) NOT NULL COMMENT '登录密码（明文存储）';

-- 3. 历史账号密码重置
--    原密码是 BCrypt 摘要，无法逆向还原为明文，这里统一重置成 123456。
--    如不想重置，请手动 UPDATE sys_user SET password='想要的明文密码' WHERE username='xxx';
UPDATE `sys_user`
   SET `password` = '123456'
 WHERE `password` LIKE '$2a$%'
    OR `password` LIKE '$2b$%'
    OR `password` LIKE '$2y$%';

-- 4. 预置管理员账号：perm = 0
--    已存在同名账号时同步更新为管理员，保证幂等可重复执行
INSERT INTO `sys_user` (`username`, `password`, `nick_name`, `status`, `perm`)
VALUES ('admin', 'admin123', '超级管理员', 1, 0)
ON DUPLICATE KEY UPDATE
  `password` = 'admin123',
  `nick_name` = '超级管理员',
  `status` = 1,
  `perm` = 0;

-- 5. 校验结果
SELECT id, username, password, nick_name, status, perm FROM `sys_user`;
