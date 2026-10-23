package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.CodexHero;
import com.fenglin.springboottest.entity.CodexItem;
import com.fenglin.springboottest.entity.CodexTrait;
import com.fenglin.springboottest.mapper.CodexHeroMapper;
import com.fenglin.springboottest.mapper.CodexItemMapper;
import com.fenglin.springboottest.mapper.CodexTraitMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 后台管理系统 · 图鉴数据 CRUD
 * 鉴权：AdminInterceptor（管理员 token）
 * 说明：JSON 列（traits / stats / items / recipe / for / tiers）由前端
 *       JSON.stringify 后以字符串提交，MySQL JSON 列自动校验格式。
 */
@RestController
@RequestMapping("/api/admin")
public class AdminCodexController {

    @Autowired
    private CodexHeroMapper heroMapper;

    @Autowired
    private CodexItemMapper itemMapper;

    @Autowired
    private CodexTraitMapper traitMapper;

    /* ============================================================
     * 英雄
     * ============================================================ */

    @GetMapping("/heroes")
    public Result<List<CodexHero>> listHeroes() {
        return Result.ok(heroMapper.selectList(
                com.baomidou.mybatisplus.core.toolkit.Wrappers.<CodexHero>lambdaQuery()
                        .orderByAsc(CodexHero::getSort).orderByAsc(CodexHero::getId)));
    }

    @PostMapping("/heroes")
    public Result<CodexHero> createHero(@RequestBody CodexHero hero) {
        checkHero(hero);
        hero.setId(null);
        try {
            heroMapper.insert(hero);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "英雄名「" + hero.getName() + "」已存在");
        }
        return Result.ok(hero);
    }

    @PutMapping("/heroes/{id}")
    public Result<CodexHero> updateHero(@PathVariable Long id, @RequestBody CodexHero hero) {
        checkHero(hero);
        hero.setId(id);
        try {
            heroMapper.updateById(hero);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "英雄名「" + hero.getName() + "」已被其他英雄占用");
        }
        return Result.ok(hero);
    }

    @DeleteMapping("/heroes/{id}")
    public Result<String> deleteHero(@PathVariable Long id) {
        heroMapper.deleteById(id);
        return Result.ok("已删除");
    }

    private void checkHero(CodexHero hero) {
        if (hero.getName() == null || hero.getName().isBlank()) {
            throw new BizException(400, "英雄名不能为空");
        }
        if (hero.getCost() == null || hero.getCost() < 1 || hero.getCost() > 5) {
            throw new BizException(400, "费用必须是 1~5");
        }
    }

    /* ============================================================
     * 装备
     * ============================================================ */

    @GetMapping("/items")
    public Result<List<CodexItem>> listItems() {
        return Result.ok(itemMapper.selectList(
                com.baomidou.mybatisplus.core.toolkit.Wrappers.<CodexItem>lambdaQuery()
                        .orderByAsc(CodexItem::getSort).orderByAsc(CodexItem::getId)));
    }

    @PostMapping("/items")
    public Result<CodexItem> createItem(@RequestBody CodexItem item) {
        checkItem(item);
        item.setId(null);
        try {
            itemMapper.insert(item);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "装备名「" + item.getName() + "」已存在");
        }
        return Result.ok(item);
    }

    @PutMapping("/items/{id}")
    public Result<CodexItem> updateItem(@PathVariable Long id, @RequestBody CodexItem item) {
        checkItem(item);
        item.setId(id);
        try {
            itemMapper.updateById(item);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "装备名「" + item.getName() + "」已被其他装备占用");
        }
        return Result.ok(item);
    }

    @DeleteMapping("/items/{id}")
    public Result<String> deleteItem(@PathVariable Long id) {
        itemMapper.deleteById(id);
        return Result.ok("已删除");
    }

    private void checkItem(CodexItem item) {
        if (item.getName() == null || item.getName().isBlank()) {
            throw new BizException(400, "装备名不能为空");
        }
        if (item.getType() == null || item.getType().isBlank()) {
            item.setType("合成");
        }
        if (!"基础".equals(item.getType()) && !"合成".equals(item.getType())) {
            throw new BizException(400, "装备类型只能是「基础」或「合成」");
        }
    }

    /* ============================================================
     * 羁绊
     * ============================================================ */

    @GetMapping("/traits")
    public Result<List<CodexTrait>> listTraits() {
        return Result.ok(traitMapper.selectList(
                com.baomidou.mybatisplus.core.toolkit.Wrappers.<CodexTrait>lambdaQuery()
                        .orderByAsc(CodexTrait::getSort).orderByAsc(CodexTrait::getId)));
    }

    @PostMapping("/traits")
    public Result<CodexTrait> createTrait(@RequestBody CodexTrait trait) {
        checkTrait(trait);
        trait.setId(null);
        try {
            traitMapper.insert(trait);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "羁绊名「" + trait.getName() + "」已存在");
        }
        return Result.ok(trait);
    }

    @PutMapping("/traits/{id}")
    public Result<CodexTrait> updateTrait(@PathVariable Long id, @RequestBody CodexTrait trait) {
        checkTrait(trait);
        trait.setId(id);
        try {
            traitMapper.updateById(trait);
        } catch (DuplicateKeyException e) {
            throw new BizException(409, "羁绊名「" + trait.getName() + "」已被其他羁绊占用");
        }
        return Result.ok(trait);
    }

    @DeleteMapping("/traits/{id}")
    public Result<String> deleteTrait(@PathVariable Long id) {
        traitMapper.deleteById(id);
        return Result.ok("已删除");
    }

    private void checkTrait(CodexTrait trait) {
        if (trait.getName() == null || trait.getName().isBlank()) {
            throw new BizException(400, "羁绊名不能为空");
        }
        if (trait.getType() == null || trait.getType().isBlank()) {
            trait.setType("职业");
        }
        if (!"职业".equals(trait.getType()) && !"种族".equals(trait.getType())) {
            throw new BizException(400, "羁绊类型只能是「职业」或「种族」");
        }
    }
}
