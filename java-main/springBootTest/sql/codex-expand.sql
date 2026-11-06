-- 装备图鉴扩充：按《金铲铲之战》补全 9 散件 × 两两组合的全部 45 件成品装备
-- 现有 19 件合成装备 + 新增 26 件 = 45 件；基础散件 9 件不变
-- 同时修正石像鬼板甲的合成公式（真实合成：锁子甲 + 负极斗篷）
-- 幂等：重复执行不会产生重复数据（name 有唯一索引，INSERT IGNORE）
USE `springboottest`;

-- 修正石像鬼板甲配方与属性（原先误写为 无用大棒+锁子甲）
UPDATE codex_item
SET recipe = '["锁子甲","负极斗篷"]', stats = '+25 护甲，+25 魔法抗性'
WHERE name = '石像鬼板甲';

-- 新增成品装备（sort 29-54，接续原有序列）
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('朔极之矛', '合成', '["暴风大剑","女神之泪"]', '+15 攻击力，+15 法力值', '释放技能后立刻回复 15 点法力值，让低蓝量英雄高频开大，人送外号「青龙刀」。', '["烬","艾希","卡尔玛"]', 29);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('基克的先驱', '合成', '["暴风大剑","巨人腰带"]', '+15 攻击力，+200 生命值', '战斗开始时为携带者左右两格的友军提供 20% 攻击速度光环，物理阵容的团队增益装。', '["奥拉夫","盖伦","锐雯"]', 30);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('无尽之刃', '合成', '["暴风大剑","拳套"]', '+15 攻击力，+10% 暴击几率，+10% 闪避几率', '暴击伤害大幅提升，溢出的暴击几率还会转化为攻击力，物理主 C 的伤害放大器。', '["烬","亚索","格雷福斯"]', 31);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('斯塔缇克电刃', '合成', '["反曲之弓","女神之泪"]', '+15% 攻击速度，+15 法力值', '每第 3 次攻击对至多 4 名敌人造成链式魔法伤害，人越多清得越快。', '["艾希","薇恩","卡尔玛"]', 32);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('泰坦的坚决', '合成', '["反曲之弓","锁子甲"]', '+15% 攻击速度，+25 护甲', '每次攻击或受击叠加 2% 攻击力与法术强度，最多 25 层，叠满后额外获得 20% 伤害减免。', '["锐雯","奥拉夫","努努"]', 33);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('卢安娜的飓风', '合成', '["反曲之弓","负极斗篷"]', '+15% 攻击速度，+25 魔法抗性', '普攻会向相邻的 2 名敌人各射出一支箭矢，造成部分攻击力的伤害，群伤利器。', '["艾希","薇恩","烬"]', 34);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('兹若特传送门', '合成', '["反曲之弓","巨人腰带"]', '+15% 攻击速度，+200 生命值', '战斗开始时召唤一只继承携带者部分属性的虚灵冲在前排，白嫖一个扛伤单位。', '["努努","布隆","奥恩"]', 35);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('最后的轻语', '合成', '["反曲之弓","拳套"]', '+15% 攻击速度，+10% 暴击几率，+10% 闪避几率', '攻击削减目标 40% 护甲，对付高护甲前排有奇效，物理输出的第二件神装。', '["薇恩","烬","格雷福斯"]', 36);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('钢铁烈阳之匣', '合成', '["无用大棒","锁子甲"]', '+15 法术强度，+25 护甲', '战斗开始时为携带者及相邻友军提供持续 8 秒的护盾，抵御对方开场爆发。', '["慎","布隆","盖伦"]', 37);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('离子火花', '合成', '["无用大棒","负极斗篷"]', '+15 法术强度，+25 魔法抗性', '降低附近敌人的魔法抗性，敌人施放技能时还会被闪电反噬，法坦贴脸神器。', '["维克兹","凯隐","卡萨丁"]', 38);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('珠光护手', '合成', '["无用大棒","拳套"]', '+15 法术强度，+10% 暴击几率，+10% 闪避几率', '技能可以暴击并附带额外暴击伤害，法系主 C 的伤害从此发生质变。', '["维克兹","阿卡丽","艾尼维亚"]', 39);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('圣盾使的誓约', '合成', '["女神之泪","锁子甲"]', '+15 法力值，+25 护甲', '战斗开始时为携带者及相邻友军提供一层护盾，安心度过最脆弱的开局。', '["璐璐","卡尔玛","慎"]', 40);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('能量圣杯', '合成', '["女神之泪","负极斗篷"]', '+15 法力值，+25 魔法抗性', '战斗开始时为相邻两格的友军提供 20 点法术强度，法师阵容的起手增益。', '["璐璐","悠米","卡尔玛"]', 41);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('救赎', '合成', '["女神之泪","巨人腰带"]', '+15 法力值，+200 生命值', '生命值首次低于 40% 时治疗全体友军，团队续航的核心装备。', '["璐璐","悠米","布隆"]', 42);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('正义之手', '合成', '["女神之泪","拳套"]', '+15 法力值，+10% 暴击几率，+10% 闪避几率', '每回合随机获得 30% 额外伤害或 20 点法力回复之一，赌赢就是赚。', '["卡尔玛","维克兹","亚索"]', 43);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('日炎斗篷', '合成', '["锁子甲","巨人腰带"]', '+25 护甲，+200 生命值', '每秒灼烧周围的敌人并施加重伤，坦克挂件的持续输出与反治疗利器。', '["盖伦","奥恩","慎"]', 44);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('静止法衣', '合成', '["锁子甲","拳套"]', '+25 护甲，+10% 暴击几率，+10% 闪避几率', '战斗开始时使敌方全体首次施法延后，克制速开大的爆发阵容。', '["慎","布隆","李青"]', 45);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('灵风', '合成', '["负极斗篷","巨人腰带"]', '+25 魔法抗性，+200 生命值', '战斗开始时将一名敌人吹离战场 5 秒，局部形成以多打少的局面。', '["李青","努努","奥恩"]', 46);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('水银', '合成', '["负极斗篷","拳套"]', '+25 魔法抗性，+10% 暴击几率，+10% 闪避几率', '免疫所有控制效果，主 C 面对强控阵容的保命底线。', '["亚索","烬","奥拉夫"]', 47);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('女妖之爪', '合成', '["巨人腰带","拳套"]', '+200 生命值，+10% 暴击几率，+10% 闪避几率', '战斗开始时为携带者及相邻友军格挡敌方的第一个技能，专治先手控制。', '["盖伦","布隆","锐雯"]', 48);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('金铲铲冠冕', '合成', '["金铲铲","金铲铲"]', '特殊：上阵人口 +1', '传说中最奢侈的合成。两把金铲铲合为一体，直接多出一个上阵位，多一个单位就是质变。', NULL, 49);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('枪手徽章', '合成', '["金铲铲","女神之泪"]', '携带者获得【枪手】羁绊', '让任意英雄获得枪手羁绊，溅射流阵容的最后一块拼图。', '["格雷福斯","厄加特","烬"]', 50);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('骑士徽章', '合成', '["金铲铲","锁子甲"]', '携带者获得【骑士】羁绊', '让任意英雄获得骑士羁绊，凑齐高骑士减伤体系的关键道具。', '["盖伦","布隆","慎"]', 51);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('秘术师徽章', '合成', '["金铲铲","负极斗篷"]', '携带者获得【秘术师】羁绊', '让任意英雄获得秘术师羁绊，面对法师阵容时的团队魔抗保险。', '["卡尔玛","悠米","艾尼维亚"]', 52);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('斗士徽章', '合成', '["金铲铲","巨人腰带"]', '携带者获得【斗士】羁绊', '让任意英雄获得斗士羁绊，高血量前排体系的人口补充件。', '["努努","奥拉夫","厄加特"]', 53);
INSERT IGNORE INTO codex_item (name, type, recipe, stats, `desc`, `for`, sort) VALUES ('刺客徽章', '合成', '["金铲铲","拳套"]', '携带者获得【刺客】羁绊', '让任意英雄获得刺客羁绊，让输出位也能切入敌方后排。', '["阿卡丽","凯隐","亚索"]', 54);
