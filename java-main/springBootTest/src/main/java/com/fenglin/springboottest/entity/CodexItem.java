package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 装备图鉴实体，对应表 codex_item
 * 注意：`desc` / `for` 是 SQL 关键字，@TableName 字段映射由 map-underscore-to-camel-case
 * 处理，`for` 用 @TableField 显式指定列名。
 */
@TableName("codex_item")
public class CodexItem {

    /** 主键，自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 装备名（唯一） */
    private String name;

    /** 类型：基础 / 合成 */
    private String type;

    /** 合成配方 JSON（装备名数组，基础散件为 NULL） */
    private String recipe;

    /** 属性加成，如 +30 攻击力 */
    private String stats;

    /** 装备说明（列名 desc，MySQL 关键字需反引号） */
    @com.baomidou.mybatisplus.annotation.TableField("`desc`")
    private String desc;

    /** 适用英雄名列表 JSON（列名 for，MySQL 关键字需反引号） */
    @com.baomidou.mybatisplus.annotation.TableField("`for`")
    private String forHeroes;

    /** 排序 */
    private Integer sort;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 更新时间 */
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRecipe() {
        return recipe;
    }

    public void setRecipe(String recipe) {
        this.recipe = recipe;
    }

    public String getStats() {
        return stats;
    }

    public void setStats(String stats) {
        this.stats = stats;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getForHeroes() {
        return forHeroes;
    }

    public void setForHeroes(String forHeroes) {
        this.forHeroes = forHeroes;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
