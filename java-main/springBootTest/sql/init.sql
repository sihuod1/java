-- ============================================================
-- 金铲铲之战 · 用户中心 建库建表脚本
-- 数据库：springboottest
-- 字符集：utf8mb4   引擎：InnoDB   MySQL 8.0
-- 执行方式（在本地 MySQL 客户端）：
--   mysql -u root -p < sql/init.sql
-- ============================================================

-- 创建数据库（不存在才创建）
CREATE DATABASE IF NOT EXISTS `springboottest`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

-- 使用数据库
USE `springboottest`;

-- 用户表
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username`    VARCHAR(64)   NOT NULL                COMMENT '登录账号',
  `password`    VARCHAR(100)  NOT NULL                COMMENT '登录密码（BCrypt 加密存储）',
  `nick_name`   VARCHAR(64)   NOT NULL DEFAULT ''     COMMENT '昵称',
  `status`      TINYINT       NOT NULL DEFAULT 1      COMMENT '状态：1-正常 0-禁用',
  `create_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP                  COMMENT '创建时间',
  `update_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统用户表';
