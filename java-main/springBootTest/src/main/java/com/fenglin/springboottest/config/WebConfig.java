package com.fenglin.springboottest.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 注册登录态拦截器：
 * - 前台用户 token：拦截 /api/**（放行 login / register / codex 公开接口 / admin 全部）
 * - 后台管理员 token：拦截 /api/admin/**（放行 /api/admin/login）
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Autowired
    private AdminInterceptor adminInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/login", "/api/register")
                // 图鉴公开接口：首页无需登录即可浏览
                .excludePathPatterns("/api/codex/**")
                // 管理接口由 AdminInterceptor 单独校验
                .excludePathPatterns("/api/admin/**");
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns("/api/admin/login");
    }
}
