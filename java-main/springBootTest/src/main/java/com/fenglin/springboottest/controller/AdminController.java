package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 后台管理系统：管理员登录 / 当前信息 / 退出
 *
 * 管理员不再是独立的一张表，而是复用 sys_user：
 *   perm = 0 -> 管理员，允许登录后台
 *   perm = 1 -> 普通用户，禁止登录后台（首页也不展示入口）
 * 密码明文比对。
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TokenService tokenService;

    /** POST /api/admin/login -> {token, username, nickName, perm} */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new BizException(400, "请输入管理员账号和密码");
        }

        User user = userMapper.selectOne(
                new QueryWrapper<User>().eq("username", username.trim()));
        if (user == null || !password.equals(user.getPassword())) {
            throw new BizException(401, "管理员账号或密码错误");
        }
        // 密码正确后再校验权限：避免暴露某个账号是否为管理员
        if (!User.PERM_ADMIN.equals(user.getPerm())) {
            throw new BizException(403, "该账号不是管理员，无权进入后台管理系统");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BizException(401, "账号已被禁用，请联系管理员");
        }

        String token = tokenService.createAdminToken(user.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("username", user.getUsername());
        data.put("nickName", user.getNickName());
        data.put("perm", user.getPerm());
        return Result.ok(data);
    }

    /** GET /api/admin/me -> 校验管理员登录态（每次都复查权限，防止权限被撤销后仍可访问） */
    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestHeader("Authorization") String auth) {
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : null;
        Long userId = tokenService.getAdminId(token);
        if (userId == null) {
            throw new BizException(401, "登录已过期");
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(401, "账号不存在");
        }
        if (!User.PERM_ADMIN.equals(user.getPerm())) {
            throw new BizException(403, "该账号不是管理员，无权访问后台");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("username", user.getUsername());
        data.put("nickName", user.getNickName());
        data.put("perm", user.getPerm());
        return Result.ok(data);
    }

    /** POST /api/admin/logout -> 注销当前管理员 token */
    @PostMapping("/logout")
    public Result<String> logout(@RequestHeader("Authorization") String auth) {
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : null;
        tokenService.removeAdmin(token);
        return Result.ok("已退出登录");
    }
}
