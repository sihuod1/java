package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Admin;
import com.fenglin.springboottest.mapper.AdminMapper;
import com.fenglin.springboottest.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
 * （管理员账号不走注册，只能由数据库预置或 DBA 手工插入）
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /** BCrypt 密码加密器 */
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private TokenService tokenService;

    /** POST /api/admin/login -> {token, username, nickName} */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new BizException(400, "请输入管理员账号和密码");
        }
        Admin admin = adminMapper.selectOne(
                new QueryWrapper<Admin>().eq("username", username));
        if (admin == null || !passwordEncoder.matches(password, admin.getPassword())) {
            throw new BizException(401, "管理员账号或密码错误");
        }
        String token = tokenService.createAdminToken(admin.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("username", admin.getUsername());
        data.put("nickName", admin.getNickName());
        return Result.ok(data);
    }

    /** GET /api/admin/me -> 校验管理员登录态 */
    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestHeader("Authorization") String auth) {
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : null;
        Long adminId = tokenService.getAdminId(token);
        if (adminId == null) {
            throw new BizException(401, "登录已过期");
        }
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            throw new BizException(401, "管理员账号不存在");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("username", admin.getUsername());
        data.put("nickName", admin.getNickName());
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
