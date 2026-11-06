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
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 组队房间服务（内存存储，用于本地演示，重启后端即失效）。
 *
 * 流程：
 *   房主 POST /api/rooms 创建房间，获得邀请码；
 *   好友凭邀请码 POST /api/rooms/join 加入；
 *   房主 POST /api/rooms/{code}/start 开始游戏（前端各自进入 /game，此处仅做状态标记）。
 */
@Service
public class RoomService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FriendService friendService;

    /** 房间邀请码 -> 房间 */
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public static final class Room {
        public String code;
        public Long hostId;
        public String hostName;
        public boolean started;
        public long createAt;
        /** 成员 userId 列表（含房主，按加入顺序） */
        public final List<Long> members = new ArrayList<>();

        Room(String code, Long hostId, String hostName) {
            this.code = code;
            this.hostId = hostId;
            this.hostName = hostName;
            this.started = false;
            this.createAt = System.currentTimeMillis();
            this.members.add(hostId);
        }
    }

    private String genCode() {
        // 6 位大写字母+数字，避免易混淆字符
        String pool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        for (int i = 0; i < 6; i++) {
            sb.append(pool.charAt(rnd.nextInt(pool.length())));
        }
        String code = sb.toString();
        // 冲突就重试一次
        if (rooms.containsKey(code)) return genCode();
        return code;
    }

    private String nickOf(Long userId) {
        if (userId == null) return "未知";
        User u = userMapper.selectById(userId);
        if (u == null) return "未知";
        return u.getNickName() == null || u.getNickName().isEmpty() ? u.getUsername() : u.getNickName();
    }

    private Map<String, Object> memberBrief(Long userId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", userId);
        m.put("nickName", nickOf(userId));
        m.put("isHost", userId.equals(rooms.values().stream()
                .filter(r -> r.members.contains(userId))
                .findFirst().map(r -> r.hostId).orElse(null)));
        return m;
    }

    private Map<String, Object> roomBrief(Room r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("code", r.code);
        m.put("hostId", r.hostId);
        m.put("hostName", r.hostName);
        m.put("started", r.started);
        List<Map<String, Object>> ms = new ArrayList<>();
        for (Long id : r.members) {
            Map<String, Object> b = new LinkedHashMap<>();
            b.put("id", id);
            b.put("nickName", nickOf(id));
            b.put("isHost", id.equals(r.hostId));
            ms.add(b);
        }
        m.put("members", ms);
        return m;
    }

    /** 创建房间（调用者为房主） */
    public Map<String, Object> create() {
        Long me = UserContext.getUserId();
        // 若已在某房间，先退出
        leaveIfAny(me);
        String code = genCode();
        Room room = new Room(code, me, nickOf(me));
        rooms.put(code, room);
        return roomBrief(room);
    }

    /** 加入房间（凭邀请码） */
    public Map<String, Object> join(String code) {
        Long me = UserContext.getUserId();
        if (code == null || code.trim().isEmpty()) {
            throw new BizException(400, "请输入邀请码");
        }
        Room room = rooms.get(code.trim().toUpperCase());
        if (room == null) {
            throw new BizException(404, "房间不存在或已解散，请核对邀请码");
        }
        if (room.started) {
            throw new BizException(409, "该房间已开始游戏，无法加入");
        }
        if (room.members.contains(me)) {
            throw new BizException(409, "你已在该房间中");
        }
        if (room.members.size() >= 8) {
            throw new BizException(409, "房间已满（8 人）");
        }
        leaveIfAny(me);
        room.members.add(me);
        return roomBrief(room);
    }

    /** 查询房间（凭邀请码，任何人可查） */
    public Map<String, Object> detail(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new BizException(400, "请输入邀请码");
        }
        Room room = rooms.get(code.trim().toUpperCase());
        if (room == null) {
            throw new BizException(404, "房间不存在或已解散");
        }
        return roomBrief(room);
    }

    /** 我当前所在的房间（没有则返回 null） */
    public Map<String, Object> myRoom() {
        Long me = UserContext.getUserId();
        for (Room r : rooms.values()) {
            if (r.members.contains(me)) return roomBrief(r);
        }
        return null;
    }

    /** 房主开始游戏 */
    public Map<String, Object> start(String code) {
        Long me = UserContext.getUserId();
        if (code == null || code.trim().isEmpty()) {
            throw new BizException(400, "请输入邀请码");
        }
        Room room = rooms.get(code.trim().toUpperCase());
        if (room == null) {
            throw new BizException(404, "房间不存在或已解散");
        }
        if (!room.hostId.equals(me)) {
            throw new BizException(403, "只有房主可以开始游戏");
        }
        room.started = true;
        return roomBrief(room);
    }

    /** 退出房间（房主退出则解散房间） */
    public void leave(String code) {
        Long me = UserContext.getUserId();
        if (code == null || code.trim().isEmpty()) return;
        Room room = rooms.get(code.trim().toUpperCase());
        if (room == null) return;
        room.members.remove(me);
        if (room.members.isEmpty() || room.hostId.equals(me)) {
            rooms.remove(room.code);
        }
    }

    private void leaveIfAny(Long me) {
        for (Room r : rooms.values()) {
            if (r.members.contains(me)) {
                r.members.remove(me);
                if (r.members.isEmpty() || r.hostId.equals(me)) {
                    rooms.remove(r.code);
                }
                return;
            }
        }
    }
}
