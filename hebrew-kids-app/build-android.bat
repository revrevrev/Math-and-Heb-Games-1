@echo off
cd /d "%~dp0"

:: ── Locate adb ────────────────────────────────────────────────────────────────
set ADB=adb
where adb >nul 2>&1
if not errorlevel 1 goto adb_found

set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
if exist "%ADB%" goto adb_found

echo ERROR: adb not found. Make sure Android SDK is installed.
pause
exit /b 1

:adb_found

echo.
echo [1/4] Building web app...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed. Fix the errors above and try again.
    pause
    exit /b 1
)

echo.
echo [2/4] Syncing to Android...
call npx cap sync android
if errorlevel 1 (
    echo.
    echo ERROR: Cap sync failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Building APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ERROR: Gradle build failed.
    cd ..
    pause
    exit /b 1
)
cd ..

set APK=android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo [4/4] Installing to phone...

:: Find a real device (not emulator, not unauthorized)
set DEVICE=
for /f "skip=1 tokens=1,2" %%A in ('"%ADB%" devices') do (
    echo %%A | findstr /i "emulator" >nul
    if errorlevel 1 (
        if "%%B"=="device" (
            if "!DEVICE!"=="" set DEVICE=%%A
        )
    )
)

:: Enable delayed expansion for DEVICE variable
setlocal enabledelayedexpansion
set DEVICE=
for /f "skip=1 tokens=1,2" %%A in ('"%ADB%" devices') do (
    echo %%A | findstr /i "emulator" >nul
    if errorlevel 1 (
        if "%%B"=="device" (
            if "!DEVICE!"=="" set DEVICE=%%A
        )
    )
)

if "!DEVICE!"=="" (
    echo.
    echo ERROR: No authorized phone found. Check that:
    echo   - Phone is connected via USB
    echo   - USB debugging is ON ^(Developer Options^)
    echo   - You tapped "Allow" on the USB debugging popup
    echo.
    echo Devices seen:
    "%ADB%" devices
    pause
    exit /b 1
)

echo   Found device: !DEVICE!
"%ADB%" -s !DEVICE! install -r "%APK%"
if errorlevel 1 (
    echo.
    echo ERROR: Install failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Done. App installed on DEVICE !DEVICE!
echo   Open it manually on the phone to start.
echo ============================================
echo.
endlocal
