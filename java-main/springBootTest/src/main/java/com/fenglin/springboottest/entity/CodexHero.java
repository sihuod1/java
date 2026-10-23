package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 英雄图鉴实体，对应表 codex_hero
 * JSON 列（traits / stats / items）用字符串承载，序列化交给前端 JSON.parse
 */
@TableName("codex_hero")
public class CodexHero {

    /** 主键，自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 英雄名（中文，唯一） */
    private String name;

    /** 英文名（本地头像资源按此匹配） */
    private String en;

    /** 费用 1~5 */
    private Integer cost;

    /** 羁绊列表 JSON，如 ["骑士","战士"] */
    private String traits;

    /** 定位，如 前排坦克 */
    private String role;

    /** 一句话台词 */
    private String tagline;

    /** 技能名 */
    private String skillName;

    /** 技能描述 */
    private String skillDesc;

    /** 属性 JSON {hp,ad,armor,mr,as,mana} */
    private String stats;

    /** 推荐装备名列表 JSON */
    private String items;

    /** 使用心得 */
    private String tip;

    /** 排序，越小越靠前 */
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

    public String getEn() {
        return en;
    }

    public void setEn(String en) {
        this.en = en;
    }

    public Integer getCost() {
        return cost;
    }

    public void setCost(Integer cost) {
        this.cost = cost;
    }

    public String getTraits() {
        return traits;
    }

    public void setTraits(String traits) {
        this.traits = traits;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getSkillDesc() {
        return skillDesc;
    }

    public void setSkillDesc(String skillDesc) {
        this.skillDesc = skillDesc;
    }

    public String getStats() {
        return stats;
    }

    public void setStats(String stats) {
        this.stats = stats;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

    public String getTip() {
        return tip;
    }

    public void setTip(String tip) {
        this.tip = tip;
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
