@echo off
REM ============================================================
REM BUILD APK AUTOMATIZADO - BIBLIA APP
REM Sem interacao necessaria - deixe rodando!
REM ============================================================
setlocal EnableDelayedExpansion

echo.
echo ================================================
echo  BIBLIA APP - BUILD APK AUTOMATIZADO
echo ================================================
echo.
echo Este processo vai:
echo 1. Limpar builds anteriores
echo 2. Instalar dependencias necessarias
echo 3. Criar um APK instalavel
echo.
echo IMPORTANTE: Pode demorar 10-20 minutos!
echo Deixe este terminal aberto e va treinar! :)
echo.
echo Iniciando em 5 segundos...
timeout /t 5 /nobreak
echo.

REM Matar processos Node anteriores
echo [1/6] Limpando processos anteriores...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
timeout /t 2 /nobreak
echo.

REM Limpar pastas de build
echo [2/6] Limpando cache e builds antigos...
if exist "android" rmdir /S /Q "android" 2>nul
if exist ".expo" rmdir /S /Q ".expo" 2>nul
if exist "node_modules\.cache" rmdir /S /Q "node_modules\.cache" 2>nul
echo.

REM Verificar/Instalar EAS CLI
echo [3/6] Verificando EAS CLI...
call npm list -g eas-cli >nul 2>&1
if errorlevel 1 (
    echo Instalando EAS CLI globalmente...
    call npm install -g eas-cli
)
echo.

REM Fazer login no EAS (ou usar local build)
echo [4/6] Configurando EAS...
echo Usando build LOCAL (nao precisa de conta Expo)
echo.

REM Criar android folder
echo [5/6] Gerando projeto Android nativo...
call npx expo prebuild --platform android --clean --no-install
timeout /t 3 /nobreak
echo.

REM BUILD!
echo [6/6] INICIANDO BUILD DO APK...
echo ================================================
echo.
echo Isso vai demorar! Aguarde...
echo.

REM Build local do APK
call npx expo run:android --variant release --no-bundler

if errorlevel 1 (
    echo.
    echo ================================================
    echo ERRO NO BUILD!
    echo ================================================
    echo.
    echo Tentando abordagem alternativa...
    echo.
    
    REM Tentar build direto com gradle
    cd android
    call gradlew assembleRelease
    cd ..
)

echo.
echo ================================================
echo BUILD CONCLUIDO!
echo ================================================
echo.
echo O APK esta em:
echo android\app\build\outputs\apk\release\
echo.
echo Procure pelo arquivo: app-release.apk
echo.
dir android\app\build\outputs\apk\release\*.apk
echo.
echo ================================================
echo PRONTO PARA INSTALAR NO CELULAR!
echo ================================================
pause
