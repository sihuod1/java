-- ============================================================
-- 金铲铲之战 · 后台管理系统 建库建表脚本
-- 包含：图鉴三表（codex_hero / codex_item / codex_trait）+ 管理员表（sys_admin）
-- 执行方式：先执行本文件建表，再执行 codex-seed.sql 灌入种子数据
--   mysql -u root -p < sql/admin-init.sql
--   mysql -u root -p < sql/codex-seed.sql
-- ⚠️ 含 DROP TABLE，重复执行会清空数据后重建
-- ============================================================

USE `springboottest`;

-- ---------- 管理员表（后台管理系统登录用，与前台用户表分离） ----------
DROP TABLE IF EXISTS `sys_admin`;
CREATE TABLE `sys_admin` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username`    VARCHAR(64)  NOT NULL COMMENT '管理员账号',
  `password`    VARCHAR(100) NOT NULL COMMENT '密码（BCrypt 加密存储）',
  `nick_name`   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='后台管理员表';

-- ---------- 英雄图鉴表 ----------
DROP TABLE IF EXISTS `codex_hero`;
CREATE TABLE `codex_hero` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name`       VARCHAR(64)  NOT NULL COMMENT '英雄名（中文名，图鉴主键展示）',
  `en`         VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '英文名（本地头像资源按此匹配）',
  `cost`       TINYINT      NOT NULL DEFAULT 1 COMMENT '费用 1~5',
  `traits`     JSON         NULL COMMENT '羁绊列表，如 ["骑士","战士"]',
  `role`       VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '定位，如 前排坦克',
  `tagline`    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '一句话台词',
  `skill_name` VARCHAR(128) NOT NULL DEFAULT '' COMMENT '技能名',
  `skill_desc` TEXT         NULL COMMENT '技能描述',
  `stats`      JSON         NULL COMMENT '属性 {hp,ad,armor,mr,as,mana}',
  `items`      JSON         NULL COMMENT '推荐装备名列表',
  `tip`        TEXT         NULL COMMENT '使用心得',
  `sort`       INT          NOT NULL DEFAULT 0 COMMENT '排序（越小越靠前）',
  `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hero_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='英雄图鉴';

-- ---------- 装备图鉴表 ----------
DROP TABLE IF EXISTS `codex_item`;
CREATE TABLE `codex_item` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name`       VARCHAR(64)  NOT NULL COMMENT '装备名',
  `type`       VARCHAR(16)  NOT NULL DEFAULT '合成' COMMENT '类型：基础 / 合成',
  `recipe`     JSON         NULL COMMENT '合成配方（装备名数组，基础散件为 NULL）',
  `stats`      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '属性加成，如 +30 攻击力',
  `desc`       TEXT         NULL COMMENT '装备说明',
  `for`        JSON         NULL COMMENT '适用英雄名列表',
  `sort`       INT          NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='装备图鉴';

-- ---------- 羁绊图鉴表 ----------
DROP TABLE IF EXISTS `codex_trait`;
CREATE TABLE `codex_trait` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name`       VARCHAR(64)  NOT NULL COMMENT '羁绊名',
  `type`       VARCHAR(16)  NOT NULL DEFAULT '职业' COMMENT '类型：职业 / 种族',
  `icon`       VARCHAR(32)  NULL COMMENT '图标标识（前端 TraitIcon 组件用）',
  `tiers`      JSON         NULL COMMENT '等级效果 [{count,desc}]',
  `tip`        TEXT         NULL COMMENT '使用心得',
  `sort`       INT          NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_trait_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='羁绊图鉴';
