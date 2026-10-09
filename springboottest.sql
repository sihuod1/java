/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           : localhost:3306
 Source Schema         : springboottest

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 09/10/2026 14:56:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '鐧诲綍璐﹀彿',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '鐧诲綍瀵嗙爜锛圔Crypt 鍔犲瘑瀛樺偍锛',
  `nick_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '鏄电О',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '鐘舵?锛?-姝ｅ父 0-绂佺敤',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '绯荤粺鐢ㄦ埛琛' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, '123456', '$2a$10$wa1/YR1NpcQUUvB7FA/oBOMEpvrzq2GFIuiE9nOwtuk/ctnSdkGFC', '123456', 1, '2026-10-09 14:08:04', '2026-10-09 14:08:04');
INSERT INTO `sys_user` VALUES (2, 'testuser01', '$2a$10$7nIpnMwXnrstRQh3OfNXa.B1ZvX8QsHhZc50qsk/C4znTv494BMEW', '金铲铲大师', 1, '2026-10-09 14:17:08', '2026-10-09 14:17:09');

SET FOREIGN_KEY_CHECKS = 1;
