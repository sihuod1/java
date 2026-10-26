package com.fenglin.springboottest.dto;

import java.time.LocalDateTime;

/**
 * /api/me 返回数据：前端展示账号、昵称、注册时间、权限
 */
public class MeResult {

    private String username;
    private String nickName;
    private LocalDateTime createTime;

    /** 权限：1-普通用户 0-管理员 */
    private Integer perm;

    public MeResult(String username, String nickName, LocalDateTime createTime, Integer perm) {
        this.username = username;
        this.nickName = nickName;
        this.createTime = createTime;
        this.perm = perm;
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

    public Integer getPerm() {
        return perm;
    }
}
