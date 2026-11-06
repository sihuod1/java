package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 好友接口（需登录）
 *  GET  /api/friends         我的好友列表
 *  POST /api/friends         添加好友  {username}
 *  DELETE /api/friends/{id}  删除好友
 *  GET  /api/users/search?kw=xxx  搜索用户（按账号/昵称）
 */
@RestController
@RequestMapping("/api")
public class FriendsController {

    @Autowired
    private FriendService friendService;

    @GetMapping("/friends")
    public Result<List<Map<String, Object>>> list() {
        return Result.ok(friendService.myFriendList());
    }

    @PostMapping("/friends")
    public Result<Map<String, Object>> add(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        return Result.ok(friendService.addFriend(username));
    }

    @DeleteMapping("/friends/{id}")
    public Result<?> remove(@PathVariable("id") Long id) {
        friendService.removeFriend(id);
        return Result.ok("已删除好友");
    }

    @GetMapping("/users/search")
    public Result<List<Map<String, Object>>> search(@RequestParam("kw") String kw) {
        return Result.ok(friendService.search(kw));
    }
}
