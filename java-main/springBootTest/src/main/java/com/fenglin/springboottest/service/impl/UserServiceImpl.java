package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户业务实现
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    /** BCrypt 密码加密器 */
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void register(RegisterRequest req) {
        // 1. 参数校验（前端已校验，后端必须再校验，防止绕过）
        if (req == null || req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            throw new BizException(400, "账号不能为空");
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            throw new BizException(400, "密码不能为空");
        }
        String username = req.getUsername().trim();
        if (username.length() < 4) {
            throw new BizException(400, "账号至少 4 位");
        }
        if (req.getPassword().length() < 6) {
            throw new BizException(400, "密码至少 6 位");
        }

        // 2. 账号唯一性校验
        long count = this.lambdaQuery()
                .eq(User::getUsername, username)
                .count();
        if (count > 0) {
            throw new BizException(409, "该账号已被注册，换一个吧～");
        }

        // 3. 组装并加密落库
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickName(username);
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        this.save(user);
    }

    @Override
    public User authenticate(String username, String password) {
        if (username == null || username.trim().isEmpty()
                || password == null || password.isEmpty()) {
            throw new BizException(401, "账号或密码错误");
        }
        User user = this.lambdaQuery()
                .eq(User::getUsername, username.trim())
                .one();
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new BizException(401, "账号或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BizException(401, "账号已被禁用，请联系管理员");
        }
        return user;
    }

    @Override
    public void updateNickName(Long userId, String nickName) {
        if (nickName == null || nickName.trim().isEmpty()) {
            throw new BizException(400, "昵称不能为空");
        }
        if (nickName.trim().length() > 20) {
            throw new BizException(400, "昵称最长 20 个字符");
        }
        User user = this.getById(userId);
        if (user == null) {
            throw new BizException(401, "登录已过期，请重新登录");
        }
        user.setNickName(nickName.trim());
        user.setUpdateTime(LocalDateTime.now());
        this.updateById(user);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.isEmpty()
                || newPassword == null || newPassword.length() < 6) {
            throw new BizException(400, "原密码不能为空，新密码至少 6 位");
        }
        User user = this.getById(userId);
        if (user == null) {
            throw new BizException(401, "登录已过期，请重新登录");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BizException(400, "原密码不正确");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        this.updateById(user);
    }
}
