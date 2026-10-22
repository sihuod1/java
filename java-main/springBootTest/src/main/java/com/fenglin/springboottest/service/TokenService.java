package com.fenglin.springboottest.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 极简内存 Token 服务：token -> 用户ID，默认 7 天有效期。
 * 仅用于本地开发演示，重启即失效（生产应改用 Redis / JWT）。
 */
@Service
public class TokenService {

    private static final long EXPIRE_MS = 7L * 24 * 3600 * 1000;

    private static final class TokenInfo {
        final Long userId;
        final long expireAt;

        TokenInfo(Long userId) {
            this.userId = userId;
            this.expireAt = System.currentTimeMillis() + EXPIRE_MS;
        }
    }

    private final Map<String, TokenInfo> tokens = new ConcurrentHashMap<>();

    /** 为用户创建 token */
    public String createToken(Long userId) {
        String token = java.util.UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, new TokenInfo(userId));
        return token;
    }

    /** 解析 token 拿到用户ID；token 为空/无效/过期返回 null */
    public Long getUserId(String token) {
        if (token == null) {
            return null;
        }
        TokenInfo info = tokens.get(token);
        if (info == null) {
            return null;
        }
        if (System.currentTimeMillis() > info.expireAt) {
            tokens.remove(token);
            return null;
        }
        return info.userId;
    }

    /** 注销单个 token（退出登录） */
    public void remove(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }

    /** 让某用户的所有 token 失效（改密码后强制全部下线） */
    public void invalidateUser(Long userId) {
        tokens.entrySet().removeIf(e -> userId.equals(e.getValue().userId));
    }
}
