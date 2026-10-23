package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.CodexHero;
import org.apache.ibatis.annotations.Mapper;

/**
 * 英雄图鉴表 Mapper
 */
@Mapper
public interface CodexHeroMapper extends BaseMapper<CodexHero> {
}
