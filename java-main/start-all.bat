@echo off
REM ============================================================
REM  Start all services (double-click)
REM    backend  : springBootTest  -> http://localhost:8081
REM    frontend : frontend        -> http://localhost:5173
REM  Requires: MySQL on 3306 (root/123456, db: springboottest)
REM  NOTE: there is NO 8082 old backend and NO java-main\backend dir.
REM  See AI-STARTUP.md (guide for AI assistant) for details.
REM ============================================================
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo [1/2] Starting backend on 8081 ...
start "backend-8081" /D "%ROOT%\springBootTest" cmd /k "set SERVER__PORT= && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev"

echo [2/2] Starting frontend on 5173 ...
if not exist "%ROOT%\frontend\node_modules" (
    echo node_modules missing, running npm install first ...
    pushd "%ROOT%\frontend"
    call npm install
    popd
)
start "frontend-5173" /D "%ROOT%\frontend" cmd /k "npm run dev"

echo.
echo Frontend : http://localhost:5173
echo Backend  : http://localhost:8081
echo Test user: testuser01 / xyz789
echo First run may take 1-2 minutes (Maven downloads dependencies).
pause
