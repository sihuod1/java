package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 组队房间接口（需登录）
 *  POST   /api/rooms             创建房间（房主）
 *  POST   /api/rooms/join        加入房间  {code}
 *  GET    /api/rooms/{code}      查询房间详情
 *  GET    /api/rooms/mine        我当前所在的房间（无则 data=null）
 *  POST   /api/rooms/{code}/start 房主开始游戏
 *  POST   /api/rooms/{code}/leave 退出房间（房主退出即解散）
 */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public Result<Map<String, Object>> create() {
        return Result.ok(roomService.create());
    }

    @PostMapping("/join")
    public Result<Map<String, Object>> join(@RequestBody Map<String, String> body) {
        return Result.ok(roomService.join(body.get("code")));
    }

    @GetMapping("/mine")
    public Result<Map<String, Object>> mine() {
        return Result.ok(roomService.myRoom());
    }

    @GetMapping("/{code}")
    public Result<Map<String, Object>> detail(@PathVariable("code") String code) {
        return Result.ok(roomService.detail(code));
    }

    @PostMapping("/{code}/start")
    public Result<Map<String, Object>> start(@PathVariable("code") String code) {
        return Result.ok(roomService.start(code));
    }

    @PostMapping("/{code}/leave")
    public Result<?> leave(@PathVariable("code") String code) {
        roomService.leave(code);
        return Result.ok("已退出房间");
    }
}
