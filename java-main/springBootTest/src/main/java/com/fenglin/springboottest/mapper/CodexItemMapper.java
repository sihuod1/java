package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.CodexItem;
import org.apache.ibatis.annotations.Mapper;

/**
 * 装备图鉴表 Mapper
 */
@Mapper
public interface CodexItemMapper extends BaseMapper<CodexItem> {
}
