package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.entity.User;

/**
 * 用户业务接口
 */
public interface UserService extends IService<User> {

    /**
     * 注册新用户
     *
     * @param req 注册参数（账号、密码）
     * @throws com.fenglin.springboottest.common.BizException 账号已存在(409) / 参数不合法(400)
     */
    void register(RegisterRequest req);

    /**
     * 登录校验：账号密码正确且未禁用则返回用户，否则抛 BizException(401)
     */
    User authenticate(String username, String password);

    /** 修改当前登录用户的昵称 */
    void updateNickName(Long userId, String nickName);

    /** 修改密码：校验原密码后更新（改密后由调用方使该用户所有 token 失效） */
    void changePassword(Long userId, String oldPassword, String newPassword);
}
