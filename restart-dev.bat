@echo off
echo ========================================
echo   SIPETA - Clean Restart Dev Server
echo ========================================
echo.

REM Step 1: Kill all Node processes
echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo       ... Node processes stopped
) else (
    echo       ... No Node processes found
)
timeout /t 2 >nul

REM Step 2: Delete .next folder
echo [2/4] Cleaning build cache (.next folder)...
if exist .next (
    rmdir /s /q .next
    echo       ... Build cache deleted
) else (
    echo       ... No cache found
)

REM Step 3: Delete node_modules cache
echo [3/4] Cleaning node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo       ... Node cache deleted
) else (
    echo       ... No node cache found
)

REM Step 4: Start dev server
echo [4/4] Starting development server...
echo.
echo ========================================
echo   Server will start on port 3000
echo   Press Ctrl+C to stop
echo ========================================
echo.

npm run dev
