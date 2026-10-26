package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 系统用户实体，对应表 sys_user
 */
@TableName("sys_user")
public class User {

    /** 权限：管理员（可登录后台管理系统） */
    public static final Integer PERM_ADMIN = 0;

    /** 权限：普通用户（默认权限，注册即此值） */
    public static final Integer PERM_USER = 1;

    /** 主键，自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 登录账号 */
    private String username;

    /** 登录密码（明文存储） */
    private String password;

    /** 昵称 */
    private String nickName;

    /** 状态：1-正常 0-禁用 */
    private Integer status;

    /** 权限：1-普通用户（默认） 0-管理员 */
    private Integer perm;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 更新时间 */
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getPerm() {
        return perm;
    }

    public void setPerm(Integer perm) {
        this.perm = perm;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    /** 是否管理员权限（仅 perm = 0 为管理员） */
    public boolean isAdmin() {
        return PERM_ADMIN.equals(this.perm);
    }
}
