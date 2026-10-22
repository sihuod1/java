package com.fenglin.springboottest.common;

/**
 * 统一接口返回结构
 * 前端约定：code == 0 表示成功
 */
public class Result<T> {

    /** 业务码：0 成功，非 0 失败 */
    private int code;

    /** 提示信息 */
    private String message;

    /** 数据载体 */
    private T data;

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.code = 0;
        r.message = "success";
        r.data = data;
        return r;
    }

    public static <T> Result<T> ok(String message) {
        Result<T> r = new Result<>();
        r.code = 0;
        r.message = message;
        return r;
    }

    public static <T> Result<T> error(String message) {
        Result<T> r = new Result<>();
        r.code = 1;
        r.message = message;
        return r;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
