package com.fenglin.springboottest.common;

/**
 * 登录用户上下文：在请求线程内传递当前登录用户 ID（由 AuthInterceptor 写入，afterCompletion 清理）
 */
public class UserContext {
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();

    public static void setUserId(Long id) {
        USER_ID.set(id);
    }

    public static Long getUserId() {
        return USER_ID.get();
    }

    public static void clear() {
        USER_ID.remove();
    }
}
