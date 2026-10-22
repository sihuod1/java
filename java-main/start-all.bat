@echo off
REM ============================================================
REM  Start all services (for double-click use)
REM    - java-main backend  : http://localhost:8081
REM    - java-main frontend : http://localhost:5173
REM    - springBootTest old : http://localhost:8082
REM  Requires: MySQL running on 3306 (root/123456, db: springboottest)
REM  See AI-STARTUP.md for details (guide for AI assistant)
REM ============================================================
echo [1/3] Starting java-main backend (port 8081) ...
cd /d "%~dp0java-main\backend"
start "java-main-backend-8081" cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev"

echo [2/3] Starting java-main frontend (port 5173) ...
cd /d "%~dp0java-main\frontend"
if not exist node_modules (
    echo node_modules missing, running npm install first ...
    call npm install
)
start "java-main-frontend-5173" cmd /c "npm run dev"

echo [3/3] Starting springBootTest old backend (port 8082) ...
cd /d "%~dp0springBootTest"
start "springboottest-8082" cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo All 3 services launching in separate windows.
echo   Frontend : http://localhost:5173
echo   New API  : http://localhost:8081
echo   Old app  : http://localhost:8082/user/to_login
echo.
echo First run may take 1-2 minutes (Maven downloads dependencies).
pause
