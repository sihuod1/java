package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.CodexHero;
import com.fenglin.springboottest.entity.CodexItem;
import com.fenglin.springboottest.entity.CodexTrait;
import com.fenglin.springboottest.mapper.CodexHeroMapper;
import com.fenglin.springboottest.mapper.CodexItemMapper;
import com.fenglin.springboottest.mapper.CodexTraitMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 图鉴公开只读接口：首页展示用，无需登录
 * 数据由后台管理系统（/api/admin/**）维护
 */
@RestController
@RequestMapping("/api/codex")
public class CodexController {

    @Autowired
    private CodexHeroMapper heroMapper;

    @Autowired
    private CodexItemMapper itemMapper;

    @Autowired
    private CodexTraitMapper traitMapper;

    /** GET /api/codex/heroes -> 英雄列表（按 sort 排序） */
    @GetMapping("/heroes")
    public Result<List<CodexHero>> heroes() {
        return Result.ok(heroMapper.selectList(
                new QueryWrapper<CodexHero>().orderByAsc("sort").orderByAsc("id")));
    }

    /** GET /api/codex/items -> 装备列表 */
    @GetMapping("/items")
    public Result<List<CodexItem>> items() {
        return Result.ok(itemMapper.selectList(
                new QueryWrapper<CodexItem>().orderByAsc("sort").orderByAsc("id")));
    }

    /** GET /api/codex/traits -> 羁绊列表 */
    @GetMapping("/traits")
    public Result<List<CodexTrait>> traits() {
        return Result.ok(traitMapper.selectList(
                new QueryWrapper<CodexTrait>().orderByAsc("sort").orderByAsc("id")));
    }
}
