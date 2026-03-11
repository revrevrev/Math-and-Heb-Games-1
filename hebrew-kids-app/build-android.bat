@echo off
cd /d "%~dp0"

echo.
echo [1/3] Building web app...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed. Fix the errors above and try again.
    pause
    exit /b 1
)

echo.
echo [2/3] Syncing to Android...
call npx cap sync android
if errorlevel 1 (
    echo.
    echo ERROR: Cap sync failed. Fix the errors above and try again.
    pause
    exit /b 1
)

echo.
echo [3/3] Opening Android Studio...
call npx cap open android
if errorlevel 1 (
    echo.
    echo ERROR: Could not open Android Studio.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Now connect your phone and Run in Android Studio.
echo ============================================
echo.

