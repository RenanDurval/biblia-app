@echo off
REM ======================================================
REM BIBLIA APP - BUILD ANDROID (Totalmente Automatizado)
REM ======================================================
setlocal

echo.
echo ========================================
echo  BIBLIA APP - BUILD ANDROID
echo ========================================
echo.

REM Localizar Android SDK
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_SDK_ROOT%" (
    set "ANDROID_SDK_ROOT=%USERPROFILE%\AppData\Local\Android\Sdk"
)

if not exist "%ANDROID_SDK_ROOT%" (
    echo [ERRO] Android SDK nao encontrado!
    pause
    exit /b 1
)

echo [OK] SDK: %ANDROID_SDK_ROOT%
echo.

REM Adicionar ao PATH
set "PATH=%ANDROID_SDK_ROOT%\platform-tools;%ANDROID_SDK_ROOT%\emulator;%PATH%"

echo [1/5] Verificando dispositivos...
"%ANDROID_SDK_ROOT%\platform-tools\adb.exe" devices
echo.

echo [2/5] Buscando emuladores...
"%ANDROID_SDK_ROOT%\emulator\emulator.exe" -list-avds > emulators_temp.txt
set /p EMULATOR_NAME=<emulators_temp.txt
del emulators_temp.txt

if "%EMULATOR_NAME%"=="" (
    echo [AVISO] Nenhum emulador encontrado!
    echo.
    echo Por favor:
    echo 1. Abra o Android Studio
    echo 2. Tools ^> Device Manager
    echo 3. Crie um emulador
    echo 4. OU conecte um celular via USB
    echo.
    pause
    exit /b 1
)

echo [OK] Emulador: %EMULATOR_NAME%
echo.

echo [3/5] Iniciando emulador em background...
start "" "%ANDROID_SDK_ROOT%\emulator\emulator.exe" -avd %EMULATOR_NAME% -no-snapshot-load
echo Aguardando 30 segundos para o emulador iniciar...
timeout /t 30 /nobreak
echo.

echo [4/5] Aguardando dispositivo responder...
"%ANDROID_SDK_ROOT%\platform-tools\adb.exe" wait-for-device
echo [OK] Dispositivo conectado!
echo.

echo [5/5] Parando node/expo...
taskkill /F /IM node.exe /T 2>nul
echo.

echo ========================================
echo INICIANDO BUILD NATIVO (pode demorar!)
echo ========================================
echo.

npx expo run:android --variant debug

echo.
echo ========================================
echo BUILD COMPLETO!
echo ========================================
pause
