package com.fenglin.springboottest.common;

/**
 * 业务异常：携带对应的 HTTP 状态码，便于全局处理器返回正确响应
 */
public class BizException extends RuntimeException {

    /** 对应返回的 HTTP 状态码，如 400 / 409 */
    private final int httpStatus;

    public BizException(int httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
