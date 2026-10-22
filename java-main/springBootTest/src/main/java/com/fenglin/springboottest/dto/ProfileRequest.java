package com.fenglin.springboottest.dto;

/**
 * 修改昵称请求参数
 */
public class ProfileRequest {

    private String nickName;

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }
}
