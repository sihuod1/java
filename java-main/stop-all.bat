@echo off
REM ============================================================
REM  Stop all project services (backend 8081 / frontend 5173)
REM  MySQL service is NOT touched.
REM ============================================================
for %%P in (8081 5173) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":%%P "') do (
        echo Killing PID %%A on port %%P ...
        taskkill /F /PID %%A >nul 2>&1
    )
)
echo Done. All project services stopped.
pause
