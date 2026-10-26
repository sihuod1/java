package com.fenglin.springboottest.dto;

/**
 * 登录成功返回数据：前端会读取 token / username / nickName / perm
 */
public class LoginResult {

    private String token;
    private String username;
    private String nickName;

    /** 权限：1-普通用户 0-管理员 */
    private Integer perm;

    public LoginResult(String token, String username, String nickName, Integer perm) {
        this.token = token;
        this.username = username;
        this.nickName = nickName;
        this.perm = perm;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getNickName() {
        return nickName;
    }

    public Integer getPerm() {
        return perm;
    }
}
