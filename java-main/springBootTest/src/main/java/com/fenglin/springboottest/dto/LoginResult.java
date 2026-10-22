package com.fenglin.springboottest.dto;

/**
 * 登录成功返回数据：前端会读取 token / username / nickName
 */
public class LoginResult {

    private String token;
    private String username;
    private String nickName;

    public LoginResult(String token, String username, String nickName) {
        this.token = token;
        this.username = username;
        this.nickName = nickName;
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
}
