package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.common.UserContext;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.LoginResult;
import com.fenglin.springboottest.dto.MeResult;
import com.fenglin.springboottest.dto.PasswordRequest;
import com.fenglin.springboottest.dto.ProfileRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.TokenService;
import com.fenglin.springboottest.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 增强版用户 API（对齐前端契约）：
 * 登录 / 获取个人信息 / 退出 / 改昵称 / 改密码
 *
 * 登录与个人信息均回传 perm，供前端判断是否展示「后台管理」入口
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private UserService userService;

    @Autowired
    private TokenService tokenService;

    /** POST /api/login -> {token, username, nickName, perm} */
    @PostMapping("/login")
    public Result<LoginResult> login(@RequestBody LoginRequest req) {
        User user = userService.authenticate(req.getUsername(), req.getPassword());
        String token = tokenService.createToken(user.getId());
        LoginResult data = new LoginResult(token, user.getUsername(), user.getNickName(), user.getPerm());
        return Result.ok(data);
    }

    /** GET /api/me -> {username, nickName, createTime, perm}（需登录） */
    @GetMapping("/me")
    public Result<MeResult> me() {
        User user = userService.getById(UserContext.getUserId());
        MeResult data = new MeResult(
                user.getUsername(),
                user.getNickName(),
                user.getCreateTime(),
                user.getPerm());
        return Result.ok(data);
    }

    /** POST /api/logout（注销当前 token） */
    @PostMapping("/logout")
    public Result<?> logout(HttpServletRequest request) {
        tokenService.remove(extractToken(request));
        return Result.ok("已退出登录");
    }

    /** PUT /api/profile -> {nickName}（需登录） */
    @PutMapping("/profile")
    public Result<?> updateProfile(@RequestBody ProfileRequest req) {
        userService.updateNickName(UserContext.getUserId(), req.getNickName());
        return Result.ok("昵称修改成功");
    }

    /** PUT /api/password -> {oldPassword, newPassword}（需登录，成功后强制重新登录） */
    @PutMapping("/password")
    public Result<?> changePassword(HttpServletRequest request, @RequestBody PasswordRequest req) {
        Long userId = UserContext.getUserId();
        userService.changePassword(userId, req.getOldPassword(), req.getNewPassword());
        tokenService.invalidateUser(userId);
        return Result.ok("密码修改成功");
    }

    private String extractToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7);
        }
        return null;
    }
}
