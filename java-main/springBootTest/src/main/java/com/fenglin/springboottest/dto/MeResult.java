package com.fenglin.springboottest.dto;

import java.time.LocalDateTime;

/**
 * /api/me 返回数据：前端展示账号、昵称、注册时间
 */
public class MeResult {

    private String username;
    private String nickName;
    private LocalDateTime createTime;

    public MeResult(String username, String nickName, LocalDateTime createTime) {
        this.username = username;
        this.nickName = nickName;
        this.createTime = createTime;
    }

    public String getUsername() {
        return username;
    }

    public String getNickName() {
        return nickName;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }
}
