package com.fenglin.springboottest.service;

import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.UserContext;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 好友关系服务（内存存储，用于本地演示，重启后端即失效）。
 *
 * 数据约定：friendMap 的 key 为用户ID，value 为好友用户ID集合（双向）。
 * 前端通过 /api/friends 增删查，通过 /api/users/search 搜索可添加的用户。
 */
@Service
public class FriendService {

    @Autowired
    private UserMapper userMapper;

    /** userId -> 好友 userId 集合（双向维护） */
    private final Map<Long, Set<Long>> friendMap = new ConcurrentHashMap<>();

    /** 好友详情缓存：userId -> {id, username, nickName}，避免频繁查库 */
    private final Map<Long, Map<String, Object>> userCache = new ConcurrentHashMap<>();

    /** 取用户公开信息（带缓存） */
    public Map<String, Object> userBrief(User user) {
        if (user == null) return null;
        return userCache.computeIfAbsent(user.getId(), id -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", user.getId());
            m.put("username", user.getUsername());
            m.put("nickName", user.getNickName() == null || user.getNickName().isEmpty()
                    ? user.getUsername() : user.getNickName());
            return m;
        });
    }

    private Map<String, Object> userBriefById(Long id) {
        User u = userMapper.selectById(id);
        return u == null ? null : userBrief(u);
    }

    private Set<Long> myFriends() {
        Long me = UserContext.getUserId();
        return friendMap.computeIfAbsent(me, k -> ConcurrentHashMap.newKeySet());
    }

    /** 我当前的好友列表（含公开信息） */
    public List<Map<String, Object>> myFriendList() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Long id : myFriends()) {
            Map<String, Object> b = userBriefById(id);
            if (b != null) out.add(b);
        }
        return out;
    }

    /** 是否已是好友 */
    public boolean isFriend(Long otherId) {
        return myFriends().contains(otherId);
    }

    /** 添加好友（按用户名精确匹配） */
    public Map<String, Object> addFriend(String username) {
        Long me = UserContext.getUserId();
        if (username == null || username.trim().isEmpty()) {
            throw new BizException(400, "请输入对方账号");
        }
        User target = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username.trim()));
        if (target == null) {
            throw new BizException(404, "没有找到账号为「" + username.trim() + "」的用户");
        }
        if (target.getId().equals(me)) {
            throw new BizException(400, "不能添加自己为好友");
        }
        if (isFriend(target.getId())) {
            throw new BizException(409, "对方已经是你的好友");
        }
        // 双向添加
        myFriends().add(target.getId());
        friendMap.computeIfAbsent(target.getId(), k -> ConcurrentHashMap.newKeySet()).add(me);
        return userBrief(target);
    }

    /** 删除好友（单向移除，仅移除「我 -> 对方」） */
    public void removeFriend(Long friendId) {
        Long me = UserContext.getUserId();
        if (friendId == null) {
            throw new BizException(400, "参数不合法");
        }
        myFriends().remove(friendId);
    }

    /** 搜索用户：按账号或昵称模糊匹配（排除自己，返回公开信息 + 是否已为好友） */
    public List<Map<String, Object>> search(String keyword) {
        Long me = UserContext.getUserId();
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BizException(400, "请输入搜索关键词");
        }
        String kw = keyword.trim();
        List<User> users = userMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .like("username", kw)
                        .or()
                        .like("nick_name", kw)
                        .last("LIMIT 20"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : users) {
            if (u.getId().equals(me)) continue;
            Map<String, Object> b = userBrief(u);
            b.put("isFriend", isFriend(u.getId()));
            out.add(b);
        }
        return out;
    }
}
