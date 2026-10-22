package com.fenglin.springboottest.exception;

import com.fenglin.springboottest.common.BizException;
import com.fenglin.springboottest.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器：把异常统一包装成 {code, message} 返回，并设置正确的 HTTP 状态码
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 业务异常：返回对应的 HTTP 状态码（400 / 409 等） */
    @ExceptionHandler(BizException.class)
    public ResponseEntity<Result<?>> handleBiz(BizException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(Result.error(e.getMessage()));
    }

    /** 其他未预期异常：返回 500，并打印完整堆栈便于排查 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<?>> handleOther(Exception e) {
        log.error("未处理的异常: {}", e.toString(), e);
        String detail = e.getMessage() != null ? e.getMessage() : e.getClass().getName();
        Throwable cause = e.getCause();
        if (cause != null && cause.getMessage() != null) {
            detail += " | 原因: " + cause.getMessage();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error("服务器开小差了：" + detail));
    }
}
