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

 Date: 29/10/2026 15:10:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for codex_hero
-- ----------------------------
DROP TABLE IF EXISTS `codex_hero`;
CREATE TABLE `codex_hero`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '英雄名（中文名，图鉴主键展示）',
  `en` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '英文名（本地头像资源按此匹配）',
  `cost` tinyint NOT NULL DEFAULT 1 COMMENT '费用 1~5',
  `traits` json NULL COMMENT '羁绊列表，如 [\"骑士\",\"战士\"]',
  `role` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '定位，如 前排坦克',
  `tagline` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '一句话台词',
  `skill_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '技能名',
  `skill_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '技能描述',
  `stats` json NULL COMMENT '属性 {hp,ad,armor,mr,as,mana}',
  `items` json NULL COMMENT '推荐装备名列表',
  `tip` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '使用心得',
  `sort` int NOT NULL DEFAULT 0 COMMENT '排序（越小越靠前）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_hero_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '英雄图鉴' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of codex_hero
-- ----------------------------
INSERT INTO `codex_hero` VALUES (1, '盖伦', 'Garen', 1, '[\"骑士\", \"战士\"]', '前排坦克', '德玛西亚的正义，从不缺席。', '审判', '盖伦旋转大剑 4 秒，每秒对周围敌人造成 60 / 90 / 140 点物理伤害，旋转期间获得 40% 伤害减免。', '{\"ad\": 55, \"as\": 0.6, \"hp\": 700, \"mr\": 25, \"mana\": 60, \"armor\": 35}', '[\"守护天使\", \"荆棘之甲\", \"狂徒铠甲\"]', '开局最容易成型的前排，配骑士羁绊能硬吃一整轮伤害，前期连胜的保证。', 1, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (2, '薇恩', 'Vayne', 1, '[\"游侠\", \"暗影\"]', '持续输出', '黑夜，也会怕我。', '圣银弩箭', '每第三次攻击附加 40 / 70 / 110 点真实伤害，真实伤害无视护甲与魔法抗性。', '{\"ad\": 60, \"as\": 0.75, \"hp\": 550, \"mr\": 20, \"mana\": 0, \"armor\": 20}', '[\"疾射火炮\", \"巨人杀手\", \"鬼索的狂暴之刃\"]', '一费卡里的输出担当，攻速叠起来后是真伤来源，后期可留作补刀。', 2, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (3, '格雷福斯', 'Graves', 1, '[\"枪手\", \"海盗\"]', '爆发输出', '枪管里，还剩两发。', '烟幕弹', '向最远的敌人投掷烟幕，致盲范围内敌人 3 秒，使其普通攻击必定落空。', '{\"ad\": 62, \"as\": 0.65, \"hp\": 600, \"mr\": 20, \"mana\": 50, \"armor\": 25}', '[\"死亡之刃\", \"饮血剑\", \"巨人杀手\"]', '致盲能废掉对方主 C，前期枪手速射阵容的核心挂件。', 3, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (4, '卡萨丁', 'Kassadin', 1, '[\"法师\", \"虚空\"]', '法术刺客', '虚空，正在靠近。', '虚空行走', '瞬移到距离最远的敌人身边，获得 200 / 350 / 500 点护盾，下次攻击造成额外魔法伤害。', '{\"ad\": 45, \"as\": 0.6, \"hp\": 580, \"mr\": 30, \"mana\": 50, \"armor\": 25}', '[\"灭世者的死亡之帽\", \"蓝霸符\", \"守护天使\"]', '一费跳后排，前期骚扰敌方后排输出位非常好用。', 4, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (5, '奥恩', 'Ornn', 1, '[\"守护神\", \"雷霆\"]', '前排坦克', '这把锤子，还没凉透。', '熔炉之火', '向前方喷吐烈焰，对直线上的敌人造成 150 / 250 / 400 点魔法伤害，并降低其 30% 攻速 4 秒。', '{\"ad\": 50, \"as\": 0.55, \"hp\": 750, \"mr\": 30, \"mana\": 70, \"armor\": 40}', '[\"荆棘之甲\", \"龙爪\", \"狂徒铠甲\"]', '守护神羁绊的廉价挂件，一费就能凑羁绊，前期非常划算。', 5, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (6, '艾希', 'Ashe', 2, '[\"游侠\", \"冰川\"]', '远程控制', '我即是寒冰。', '魔法水晶箭', '射出冰箭，命中第一个敌人后造成魔法伤害并眩晕 2 / 2.5 / 3 秒，对周围敌人减速。', '{\"ad\": 65, \"as\": 0.8, \"hp\": 650, \"mr\": 20, \"mana\": 75, \"armor\": 20}', '[\"疾射火炮\", \"鬼索的狂暴之刃\", \"巨人杀手\"]', '稳定的单体控制，游侠阵容里负责开局点掉对方关键站位。', 6, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (7, '布隆', 'Braum', 2, '[\"守护神\", \"冰川\"]', '前排保护', '寒冰，不能伤我分毫。', '坚不可摧', '举起盾牌 4 秒，格挡所有飞来的弹道伤害，并为身后的友军减免 30% 伤害。', '{\"ad\": 50, \"as\": 0.55, \"hp\": 850, \"mr\": 30, \"mana\": 60, \"armor\": 45}', '[\"石像鬼板甲\", \"龙爪\", \"狂徒铠甲\"]', '举盾方向决定收益，把背后留给己方主 C 才能吃满减伤。', 7, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (8, '璐璐', 'Lulu', 2, '[\"法师\", \"森林\"]', '辅助增益', '变大！再大一点！', '狂野生长', '为生命值最低的友军附加 400 / 600 / 900 点生命值，并击飞其周围的敌人 1 秒。', '{\"ad\": 40, \"as\": 0.6, \"hp\": 600, \"mr\": 30, \"mana\": 70, \"armor\": 20}', '[\"蓝霸符\", \"灭世者的死亡之帽\", \"大天使之杖\"]', '森林羁绊的分身加上大招加血，是保护后排的经典组合。', 8, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (9, '慎', 'Shen', 2, '[\"忍者\", \"剑士\"]', '前排坦克', '均衡，存乎万物之间。', '慈悲度魂落', '为最虚弱的友军提供 400 / 600 / 900 点护盾，随后闪现到其身边并嘲讽周围敌人 2 秒。', '{\"ad\": 55, \"as\": 0.65, \"hp\": 800, \"mr\": 25, \"mana\": 80, \"armor\": 35}', '[\"守护天使\", \"荆棘之甲\", \"石像鬼板甲\"]', '集护盾、位移、嘲讽于一体，忍者羁绊在只上一个忍者时收益最高。', 9, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (10, '千珏', 'Kindred', 2, '[\"暗影\", \"游侠\"]', '团队增益', '狼会追，羊会等。', '羊灵生息', '在原地降下祝福，持续 3 / 4 / 5 秒，期间范围内友军生命值不会降至 20% 以下。', '{\"ad\": 58, \"as\": 0.7, \"hp\": 600, \"mr\": 20, \"mana\": 90, \"armor\": 20}', '[\"蓝霸符\", \"疾射火炮\", \"大天使之杖\"]', '团战续命神器，卡在对方爆发那一瞬间开大，效果拔群。', 10, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (11, '锐雯', 'Riven', 3, '[\"剑士\", \"守护神\"]', '战士切入', '我的剑，比我的过去更重。', '折翼之舞', '向前突进三段，每段造成物理伤害，第三段击飞范围内敌人并造成 200 / 350 / 600 点范围伤害。', '{\"ad\": 75, \"as\": 0.7, \"hp\": 850, \"mr\": 25, \"mana\": 60, \"armor\": 35}', '[\"守护天使\", \"饮血剑\", \"巨人杀手\"]', '剑士羁绊的攻速叠加让她越打越快，是物理阵容的中坚。', 11, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (12, '努努', 'Nunu', 3, '[\"斗士\", \"冰川\"]', '前排坦克', '雪人，从不挑食。', '吞噬', '撕咬目标，造成 500 / 700 / 1000 点真实伤害，若目标生命值低于 25% 则直接斩杀并治疗自身。', '{\"ad\": 60, \"as\": 0.6, \"hp\": 950, \"mr\": 30, \"mana\": 80, \"armor\": 40}', '[\"狂徒铠甲\", \"龙爪\", \"石像鬼板甲\"]', '真实伤害加斩杀，专门处理敌方高护甲前排。', 12, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (13, '卡尔玛', 'Karma', 3, '[\"秘术师\", \"月神\"]', '辅助增益', '心之所向，灵之所往。', '坚定不移', '为全体友军提供 250 / 400 / 650 点护盾，并提高其 25% 攻击速度，持续 5 秒。', '{\"ad\": 45, \"as\": 0.65, \"hp\": 700, \"mr\": 40, \"mana\": 70, \"armor\": 25}', '[\"蓝霸符\", \"大天使之杖\", \"灭世者的死亡之帽\"]', '秘术师羁绊提供团队魔抗，面对法师阵容时必备。', 13, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (14, '阿卡丽', 'Akali', 3, '[\"刺客\", \"忍者\"]', '后排切入', '我流之刃，不问来处。', '霞阵', '进入潜行 1.5 秒后突袭生命值最低的敌人，造成 300 / 500 / 800 点魔法伤害并回复法力值。', '{\"ad\": 80, \"as\": 0.75, \"hp\": 700, \"mr\": 30, \"mana\": 50, \"armor\": 25}', '[\"灭世者的死亡之帽\", \"守护天使\", \"海克斯科技枪刃\"]', '开局跳后排，配合刺客羁绊的暴击加成能瞬间融化敌方 C 位。', 14, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (15, '维克兹', 'Vel\'Koz', 3, '[\"法师\", \"虚空\"]', '法术输出', '让我，看看你的结构。', '生命形态瓦解射线', '引导激光 3 秒，对直线上的敌人持续造成魔法伤害，总计 700 / 1000 / 1500 点。', '{\"ad\": 45, \"as\": 0.6, \"hp\": 650, \"mr\": 35, \"mana\": 90, \"armor\": 20}', '[\"灭世者的死亡之帽\", \"蓝霸符\", \"莫雷洛秘典\"]', '站桩激光伤害极高，前提是有前排能替他挡住突进。', 15, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (16, '亚索', 'Yasuo', 4, '[\"剑士\", \"浪人\"]', '战士核心', '死亡如风，常伴吾身。', '狂风绝息斩', '闪烁到敌人最多的位置，击飞范围内敌人 1.5 秒，并造成 250 / 400 / 800 点物理伤害。', '{\"ad\": 90, \"as\": 0.8, \"hp\": 1000, \"mr\": 30, \"mana\": 50, \"armor\": 40}', '[\"守护天使\", \"饮血剑\", \"巨人杀手\"]', '剑士阵容的绝对核心，浪人羁绊让他在开局就自带护盾。', 16, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (17, '烬', 'Jhin', 4, '[\"神射手\", \"暗影\"]', '远程炮台', '艺术，需要一点点疯狂。', '完美谢幕', '架起狙击枪，射出 4 发子弹，每发造成 200% 攻击力的物理伤害，最后一发必定暴击。', '{\"ad\": 100, \"as\": 0.75, \"hp\": 850, \"mr\": 25, \"mana\": 0, \"armor\": 25}', '[\"死亡之刃\", \"疾射火炮\", \"巨人杀手\"]', '神射手羁绊让他的子弹在敌人之间弹射，成型的四发子弹能清掉半个战场。', 17, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (18, '奥拉夫', 'Olaf', 4, '[\"斗士\", \"狂战士\"]', '前排输出', '诸神黄昏，与我何干。', '诸神黄昏', '免疫所有控制效果 6 秒，获得 80% / 120% / 200% 攻速与 50% 生命偷取。', '{\"ad\": 85, \"as\": 0.75, \"hp\": 1100, \"mr\": 35, \"mana\": 70, \"armor\": 45}', '[\"饮血剑\", \"死亡之刃\", \"守护天使\"]', '免控加吸血，站得住就砍得动，斗士羁绊提供的高血量让他越战越勇。', 18, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (19, '艾尼维亚', 'Anivia', 4, '[\"法师\", \"冰川\"]', '法术控场', '冰晶，是我的呼吸。', '冰川风暴', '在目标区域召唤暴风雪 6 秒，每秒对范围内敌人造成魔法伤害并降低其 40% 攻速与移速。', '{\"ad\": 45, \"as\": 0.6, \"hp\": 800, \"mr\": 40, \"mana\": 100, \"armor\": 25}', '[\"灭世者的死亡之帽\", \"蓝霸符\", \"莫雷洛秘典\"]', '大范围减速，配合冰川羁绊的眩晕能把对方整个阵容冻在原地。', 19, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (20, '凯隐', 'Kayn', 5, '[\"刺客\", \"暗影\"]', '战场收割', '要么驾驭它，要么被它吞噬。', '巨镰横扫', '横扫战场，对路径上的敌人造成 400 / 600 / 2000 点魔法伤害，并标记他们 8 秒。', '{\"ad\": 105, \"as\": 0.8, \"hp\": 1200, \"mr\": 40, \"mana\": 60, \"armor\": 45}', '[\"灭世者的死亡之帽\", \"守护天使\", \"海克斯科技枪刃\"]', '五费刺客的巅峰，一次横扫能覆盖大半个战场，配合暗影羁绊越打越快。', 20, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (21, '厄加特', 'Urgot', 5, '[\"枪手\", \"战地机甲\"]', '处决收割', '恐惧，是种效率。', '恐惧之链', '发射链条锁住最远的敌人，将其拉向自己；若目标生命值低于 25% 则直接处决。', '{\"ad\": 110, \"as\": 0.75, \"hp\": 1300, \"mr\": 40, \"mana\": 90, \"armor\": 50}', '[\"死亡之刃\", \"守护天使\", \"饮血剑\"]', '抓人加处决，专门破解敌方躲在角落的主 C，站位靠后时尤其致命。', 21, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (22, '李青', 'Lee Sin', 5, '[\"斗士\", \"神龙尊者\"]', '前排控制', '给我，找个对手。', '猛龙摆尾', '踢飞目标，将其与撞击到的敌人一起击飞并眩晕 2 秒，造成 500 / 800 / 4000 点物理伤害。', '{\"ad\": 100, \"as\": 0.75, \"hp\": 1400, \"mr\": 45, \"mana\": 80, \"armor\": 55}', '[\"石像鬼板甲\", \"守护天使\", \"饮血剑\"]', '一脚能把敌方前排踢进后排，是打乱阵型的王牌，也是斗士阵容的顶梁柱。', 22, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_hero` VALUES (23, '悠米', 'Yuumi', 5, '[\"秘术师\", \"灵魂莲华\"]', '辅助增益', '书里说，抱紧就好。', '连打带骂', '附着到生命值最高的友军身上，每秒为其提供 150 / 250 / 800 点护盾并持续治疗。', '{\"ad\": 40, \"as\": 0.65, \"hp\": 900, \"mr\": 50, \"mana\": 60, \"armor\": 30}', '[\"大天使之杖\", \"蓝霸符\", \"灭世者的死亡之帽\"]', '附身机制让她不会被集火，配合秘术师羁绊能把团队魔抗拉满。', 23, '2026-10-26 09:00:47', '2026-10-26 09:00:47');

-- ----------------------------
-- Table structure for codex_item
-- ----------------------------
DROP TABLE IF EXISTS `codex_item`;
CREATE TABLE `codex_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '装备名',
  `type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '合成' COMMENT '类型：基础 / 合成',
  `recipe` json NULL COMMENT '合成配方（装备名数组，基础散件为 NULL）',
  `stats` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '属性加成，如 +30 攻击力',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '装备说明',
  `for` json NULL COMMENT '适用英雄名列表',
  `sort` int NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_item_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '装备图鉴' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of codex_item
-- ----------------------------
INSERT INTO `codex_item` VALUES (1, '暴风大剑', '基础', NULL, '+15 攻击力', '最纯粹的攻击力来源，几乎所有物理输出装备的起点。', NULL, 1, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (2, '反曲之弓', '基础', NULL, '+15% 攻击速度', '提升攻击频率，是攻速流与功能性装备的核心组件。', NULL, 2, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (3, '无用大棒', '基础', NULL, '+15 法术强度', '法术伤害的根基，法师阵容见到就可以先拿。', NULL, 3, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (4, '女神之泪', '基础', NULL, '+15 法力值', '加快技能释放节奏，依赖大招的英雄非常吃它。', NULL, 4, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (5, '锁子甲', '基础', NULL, '+25 护甲', '对抗物理阵容的基础防具，前排英雄的第一件。', NULL, 5, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (6, '负极斗篷', '基础', NULL, '+25 魔法抗性', '抵御法术伤害，面对法师阵容时的必需品。', NULL, 6, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (7, '巨人腰带', '基础', NULL, '+200 生命值', '简单粗暴的血量，坦克英雄的立身之本。', NULL, 7, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (8, '拳套', '基础', NULL, '+10% 暴击几率，+10% 闪避几率', '攻守兼备的稀有散件，只在特定轮次掉落，看到就抢。', NULL, 8, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (9, '金铲铲', '基础', NULL, '特殊：用于合成转职徽章', '全游戏最特殊的散件。它本身不提供属性，但与其他散件组合可以改变英雄的羁绊归属。', NULL, 9, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (10, '死亡之刃', '合成', '[\"暴风大剑\", \"暴风大剑\"]', '+30 攻击力', '每次参与击杀后永久叠加 15 点攻击力，滚雪球能力极强，给主 C 越早越好。', '[\"烬\", \"亚索\", \"奥拉夫\"]', 10, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (11, '疾射火炮', '合成', '[\"反曲之弓\", \"反曲之弓\"]', '+30% 攻击速度', '攻击距离提升一格且攻击必定命中，远程主 C 站角落也能覆盖全场。', '[\"艾希\", \"薇恩\", \"烬\"]', 11, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (12, '灭世者的死亡之帽', '合成', '[\"无用大棒\", \"无用大棒\"]', '+45 法术强度', '直接提升 50% 法术强度，法师主 C 的毕业装，越到后期收益越高。', '[\"维克兹\", \"阿卡丽\", \"凯隐\"]', 12, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (13, '蓝霸符', '合成', '[\"女神之泪\", \"女神之泪\"]', '+30 法力值', '释放技能后回复 20 点法力值，让英雄能高频开大，辅助与控制位的首选。', '[\"卡尔玛\", \"璐璐\", \"千珏\"]', 13, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (14, '荆棘之甲', '合成', '[\"锁子甲\", \"锁子甲\"]', '+50 护甲', '反弹所受普攻伤害的 100% 为魔法伤害，并降低攻击者攻速，专治物理速射阵容。', '[\"盖伦\", \"布隆\", \"奥恩\"]', 14, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (15, '龙爪', '合成', '[\"负极斗篷\", \"负极斗篷\"]', '+50 魔法抗性', '获得 50% 魔法伤害减免，法师阵容面前的前排保命装。', '[\"李青\", \"努努\", \"奥恩\"]', 15, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (16, '狂徒铠甲', '合成', '[\"巨人腰带\", \"巨人腰带\"]', '+400 生命值', '每秒回复 6% 最大生命值，前排英雄脱战后能快速回满，续航神器。', '[\"盖伦\", \"努努\", \"布隆\"]', 16, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (17, '窃贼手套', '合成', '[\"拳套\", \"拳套\"]', '每回合随机获得两件成品装备', '每回合随机提供两件成品装备，运气好的时候能直接起飞，是赌狗的最爱。', '[\"阿卡丽\", \"锐雯\", \"凯隐\"]', 17, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (18, '巨人杀手', '合成', '[\"暴风大剑\", \"反曲之弓\"]', '+15 攻击力，+15% 攻击速度', '攻击附带目标 8% 当前生命值的额外物理伤害，对付高血量前排效果显著。', '[\"薇恩\", \"烬\", \"锐雯\"]', 18, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (19, '海克斯科技枪刃', '合成', '[\"暴风大剑\", \"无用大棒\"]', '+15 攻击力，+15 法术强度', '获得 25% 全能吸血，造成伤害时为生命值最低的友军治疗，输出与续航兼备。', '[\"阿卡丽\", \"凯隐\", \"亚索\"]', 19, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (20, '守护天使', '合成', '[\"暴风大剑\", \"锁子甲\"]', '+15 攻击力，+25 护甲', '死亡后原地复活并恢复 400 点生命值，主 C 与关键前排的保命底线。', '[\"亚索\", \"锐雯\", \"盖伦\"]', 20, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (21, '饮血剑', '合成', '[\"暴风大剑\", \"负极斗篷\"]', '+15 攻击力，+25 魔法抗性', '获得 40% 生命偷取，溢出的治疗量会转化为护盾，站着不动也能打。', '[\"奥拉夫\", \"亚索\", \"锐雯\"]', 21, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (22, '鬼索的狂暴之刃', '合成', '[\"反曲之弓\", \"无用大棒\"]', '+15% 攻击速度，+15 法术强度', '每次攻击叠加 6% 攻速，持续到战斗结束，时间拖得越久伤害越高。', '[\"薇恩\", \"艾希\", \"烬\"]', 22, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (23, '莫雷洛秘典', '合成', '[\"无用大棒\", \"巨人腰带\"]', '+15 法术强度，+200 生命值', '技能命中后造成 10 秒灼烧并施加 50% 重伤，专门压制治疗与吸血阵容。', '[\"维克兹\", \"艾尼维亚\", \"卡萨丁\"]', 23, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (24, '石像鬼板甲', '合成', '[\"无用大棒\", \"锁子甲\"]', '+15 法术强度，+25 护甲', '每有一名敌人攻击自己，就获得 18 点护甲与魔法抗性，被围殴时反而最硬。', '[\"布隆\", \"李青\", \"慎\"]', 24, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (25, '大天使之杖', '合成', '[\"无用大棒\", \"女神之泪\"]', '+15 法术强度，+15 法力值', '每次释放技能后获得法术强度，持续整场战斗，越打越强的法系装备。', '[\"璐璐\", \"卡尔玛\", \"悠米\"]', 25, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (26, '剑士徽章', '合成', '[\"金铲铲\", \"暴风大剑\"]', '携带者获得【剑士】羁绊', '让任意英雄获得剑士羁绊，是凑齐剑士人数的关键道具，常用来盘活冷门卡。', '[\"亚索\", \"锐雯\", \"慎\"]', 26, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (27, '游侠徽章', '合成', '[\"金铲铲\", \"反曲之弓\"]', '携带者获得【游侠】羁绊', '让任意英雄获得游侠羁绊，方便把高费卡塞进游侠体系。', '[\"艾希\", \"薇恩\", \"千珏\"]', 27, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_item` VALUES (28, '法师徽章', '合成', '[\"金铲铲\", \"无用大棒\"]', '携带者获得【法师】羁绊', '让任意英雄获得法师羁绊，凑齐法师人数后整体法强会有质变。', '[\"维克兹\", \"阿卡丽\", \"凯隐\"]', 28, '2026-10-26 09:00:47', '2026-10-26 09:00:47');

-- ----------------------------
-- Table structure for codex_trait
-- ----------------------------
DROP TABLE IF EXISTS `codex_trait`;
CREATE TABLE `codex_trait`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '羁绊名',
  `type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '职业' COMMENT '类型：职业 / 种族',
  `icon` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图标标识（前端 TraitIcon 组件用）',
  `tiers` json NULL COMMENT '等级效果 [{count,desc}]',
  `tip` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '使用心得',
  `sort` int NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_trait_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '羁绊图鉴' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of codex_trait
-- ----------------------------
INSERT INTO `codex_trait` VALUES (1, '骑士', '职业', 'shield', '[{\"desc\": \"所有骑士获得 15% 伤害减免\", \"count\": 2}, {\"desc\": \"所有骑士获得 30% 伤害减免\", \"count\": 4}, {\"desc\": \"所有骑士获得 50% 伤害减免\", \"count\": 6}]', '开局的定海神针，两骑士就有效果，前期最容易凑的防御羁绊。', 1, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (2, '游侠', '职业', 'bow', '[{\"desc\": \"游侠有 30% 几率使接下来 3 秒攻速翻倍\", \"count\": 2}, {\"desc\": \"触发几率提升至 70%\", \"count\": 4}, {\"desc\": \"触发几率提升至 100%\", \"count\": 6}]', '远程体系的核心，攻速一旦叠起来，输出曲线会非常陡峭。', 2, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (3, '剑士', '职业', 'sword', '[{\"desc\": \"剑士的攻击有 30% 几率触发额外一次攻击\", \"count\": 2}, {\"desc\": \"触发几率提升至 60%\", \"count\": 4}, {\"desc\": \"触发几率提升至 100%\", \"count\": 6}]', '普攻触发追击，配合攻速装收益翻倍，物理阵容的主力羁绊。', 3, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (4, '刺客', '职业', 'dagger', '[{\"desc\": \"战斗开始时跳向敌方后排，获得 20% 暴击几率与 20% 暴击伤害\", \"count\": 2}, {\"desc\": \"暴击几率与暴击伤害提升至 50%\", \"count\": 4}, {\"desc\": \"暴击几率与暴击伤害提升至 80%\", \"count\": 6}]', '开局直接跳脸，专门针对缩在角落的敌方主 C。', 4, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (5, '法师', '职业', 'orb', '[{\"desc\": \"所有法师获得 20% 法术强度\", \"count\": 2}, {\"desc\": \"所有法师获得 45% 法术强度\", \"count\": 4}, {\"desc\": \"所有法师获得 80% 法术强度\", \"count\": 6}]', '全队共享法强，法系阵容的基石，配合大帽收益极高。', 5, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (6, '秘术师', '职业', 'eye', '[{\"desc\": \"全体友军获得 35 点魔法抗性\", \"count\": 2}, {\"desc\": \"全体友军获得 95 点魔法抗性\", \"count\": 4}]', '团队魔抗光环，对面法师多的时候挂两个就能大幅降低战损。', 6, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (7, '守护神', '职业', 'fortress', '[{\"desc\": \"守护神获得 150% 护盾，且护甲翻倍\", \"count\": 2}, {\"desc\": \"护盾提升至 250%\", \"count\": 4}, {\"desc\": \"护盾提升至 400%\", \"count\": 6}]', '开局自带护盾，是保护后排最直接的手段，也最不吃装备。', 7, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (8, '冰川', '种族', 'snow', '[{\"desc\": \"冰川的攻击有 20% 几率眩晕目标 1.5 秒\", \"count\": 2}, {\"desc\": \"眩晕几率提升至 35%\", \"count\": 4}, {\"desc\": \"眩晕几率提升至 50%\", \"count\": 6}]', '控制链的核心，一旦冻住对方主 C，战局会瞬间倾斜。', 8, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (9, '暗影', '种族', 'moon', '[{\"desc\": \"战斗开始时获得 40% 攻速，参与击杀后刷新\", \"count\": 2}, {\"desc\": \"战斗开始时获得 80% 攻速\", \"count\": 4}]', '越打越快的滚雪球羁绊，适合收割型阵容。', 9, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (10, '虚空', '种族', 'rift', '[{\"desc\": \"虚空单位造成真实伤害，无视目标护甲与魔抗\", \"count\": 2}]', '真实伤害无视一切防御，是拆解坦克阵容的最优解。', 10, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (11, '忍者', '种族', 'shuriken', '[{\"desc\": \"仅有 1 名忍者时，其获得 50% 攻速与伤害加成\", \"count\": 1}, {\"desc\": \"4 名忍者时，全员获得 120% 攻速与伤害加成\", \"count\": 4}]', '独特的 1 人或 4 人机制，只上一个忍者时收益最划算。', 11, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (12, '森林', '种族', 'leaf', '[{\"desc\": \"战斗开始时，复制一名森林英雄的分身\", \"count\": 2}, {\"desc\": \"复制所有森林英雄的分身\", \"count\": 4}]', '多一个分身就多一份输出与承伤，前期性价比极高。', 12, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (13, '战士', '职业', 'axe', '[{\"desc\": \"所有战士获得 15 点攻击力\", \"count\": 2}, {\"desc\": \"所有战士获得 35 点攻击力\", \"count\": 4}, {\"desc\": \"所有战士获得 60 点攻击力\", \"count\": 6}]', '最朴素的攻击力加成，物理阵容的底子，凑起来不吃站位。', 13, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (14, '枪手', '职业', 'gun', '[{\"desc\": \"枪手的攻击有 35% 几率额外命中 1 名敌人\", \"count\": 2}, {\"desc\": \"触发几率提升至 80%，最多额外命中 3 名敌人\", \"count\": 4}]', '攻击会溅射到附近敌人，人群密集时收益翻倍，清场能力一流。', 14, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (15, '海盗', '种族', 'anchor', '[{\"desc\": \"每回合第一次刷新牌库免费\", \"count\": 1}, {\"desc\": \"每回合结束时额外获得 1 金币\", \"count\": 2}]', '纯经济型羁绊，前期挂上去省下的刷新钱就是滚雪球的本钱。', 15, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (16, '雷霆', '种族', 'bolt', '[{\"desc\": \"雷霆单位暴击或释放技能时降下闪电，造成 80 点魔法伤害\", \"count\": 2}, {\"desc\": \"闪电伤害提升至 250 点\", \"count\": 4}]', '暴击与施法都能触发连锁闪电，配合攻速或法强收益很高。', 16, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (17, '斗士', '职业', 'heart', '[{\"desc\": \"所有斗士获得 400 点额外生命值\", \"count\": 2}, {\"desc\": \"所有斗士获得 800 点额外生命值\", \"count\": 4}]', '高血量前排的代表，站得住阵容才有输出空间。', 17, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (18, '月神', '种族', 'stars', '[{\"desc\": \"战斗开始时，星级最低的月神英雄临时提升一星\", \"count\": 3}]', '白嫖一次升星，中期战斗力提升非常明显，三个就能触发。', 18, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (19, '浪人', '种族', 'wave', '[{\"desc\": \"战斗开始时，若浪人相邻没有友军，则获得相当于 50% 最大生命值的护盾\", \"count\": 1}]', '关键站位：把它放在没有相邻友军的角落，就能白拿一层厚盾，代价几乎为零。', 19, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (20, '神射手', '职业', 'crosshair', '[{\"desc\": \"神射手的攻击会弹射到附近敌人，每次弹射伤害降低 35%\", \"count\": 2}, {\"desc\": \"弹射范围扩大，且伤害衰减降低至 15%\", \"count\": 4}]', '子弹在敌人之间来回弹，对手站位越密集，总伤害越高。', 20, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (21, '狂战士', '种族', 'rage', '[{\"desc\": \"战斗开始时狂战士生命值越低，攻击速度越高，最多提升 100%\", \"count\": 1}]', '残血才有输出，需要前排帮忙扛住第一波伤害。', 21, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (22, '战地机甲', '种族', 'gear', '[{\"desc\": \"战地机甲单位阵亡后化为炸弹飞向最远的敌人，造成范围魔法伤害\", \"count\": 2}, {\"desc\": \"爆炸伤害翻倍，并降低被命中目标的治疗效果\", \"count\": 4}]', '死了也要拉人垫背，专门报复躲在角落的输出位。', 22, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (23, '神龙尊者', '种族', 'cyclone', '[{\"desc\": \"神龙尊者获得 40% 法术强度与 300 点护盾\", \"count\": 2}, {\"desc\": \"法术强度提升至 100%，护盾提升至 600 点\", \"count\": 4}]', '兼具输出与生存，法坦阵容的常见拼图。', 23, '2026-10-26 09:00:47', '2026-10-26 09:00:47');
INSERT INTO `codex_trait` VALUES (24, '灵魂莲华', '种族', 'lotus', '[{\"desc\": \"灵魂莲华单位阵亡后化为花瓣，为全体友军回复 400 点生命值\", \"count\": 2}, {\"desc\": \"回复量提升至 1000 点，并为友军附加护盾\", \"count\": 4}]', '牺牲自己奶全队，续航阵容的续航保障。', 24, '2026-10-26 09:00:47', '2026-10-26 09:00:47');

-- ----------------------------
-- Table structure for sys_admin
-- ----------------------------
DROP TABLE IF EXISTS `sys_admin`;
CREATE TABLE `sys_admin`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '管理员账号',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（BCrypt 加密存储）',
  `nick_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '昵称',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_admin_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '后台管理员表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_admin
-- ----------------------------
INSERT INTO `sys_admin` VALUES (1, 'admin', 'admin123', '管理员', '2026-10-26 09:00:47', '2026-10-29 14:11:01');
INSERT INTO `sys_admin` VALUES (2, 'testuser01', '123456', '我的账号', '2026-10-26 09:00:47', '2026-10-29 14:11:01');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '鐧诲綍璐﹀彿',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录密码（明文存储）',
  `nick_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '鏄电О',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '鐘舵?锛?-姝ｅ父 0-绂佺敤',
  `perm` tinyint NOT NULL DEFAULT 1 COMMENT '权限：1-普通用户（默认） 0-管理员',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '绯荤粺鐢ㄦ埛琛' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, '123456', '123456', '123456', 1, 1, '2026-10-09 14:08:04', '2026-10-26 09:39:42');
INSERT INTO `sys_user` VALUES (2, 'testuser01', '123456', '卸妆心灵', 1, 1, '2026-10-09 14:17:08', '2026-10-29 14:53:21');
INSERT INTO `sys_user` VALUES (3, 'DDDD', '123456', '卸妆心灵', 1, 0, '2026-10-26 09:04:25', '2026-10-29 14:58:06');
INSERT INTO `sys_user` VALUES (4, 'admin', 'admin123', '超级管理员', 1, 0, '2026-10-26 09:39:42', '2026-10-26 09:39:42');

SET FOREIGN_KEY_CHECKS = 1;
