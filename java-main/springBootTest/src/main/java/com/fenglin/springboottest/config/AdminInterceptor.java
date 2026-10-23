package com.fenglin.springboottest.config;

import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理员鉴权拦截器：校验 /api/admin/**（/api/admin/login 放行）
 * 管理员 token 由 TokenService 单独存储（admin- 前缀），与前台用户 token 互不通用
 */
@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Autowired
    private TokenService tokenService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String auth = request.getHeader("Authorization");
        String token = null;
        if (auth != null && auth.startsWith("Bearer ")) {
            token = auth.substring(7);
        }
        Long adminId = tokenService.getAdminId(token);
        if (adminId == null) {
            throw new BizException(401, "管理员登录已过期，请重新登录");
        }
        return true;
    }
}
