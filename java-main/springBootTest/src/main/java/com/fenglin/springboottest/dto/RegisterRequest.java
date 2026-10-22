package com.fenglin.springboottest.dto;

/**
 * 注册请求参数
 */
public class RegisterRequest {

    /** 账号 */
    private String username;

    /** 密码（明文，由后端加密后落库） */
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
