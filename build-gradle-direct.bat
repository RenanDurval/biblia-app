@echo off
REM ============================================================
REM BUILD APK DIRETO - SEM EAS - RAPIDO E SIMPLES
REM ============================================================
setlocal

echo.
echo ================================================
echo  BUILD APK DIRETO (Gradle)
echo ================================================
echo.

REM Matar processos
echo [1/5] Limpando processos...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
timeout /t 2 /nobreak

REM Limpar builds antigos
echo [2/5] Limpando builds antigos...
if exist "android" rmdir /S /Q "android"
if exist ".expo" rmdir /S /Q ".expo"

REM Gerar projeto Android
echo [3/5] Gerando projeto Android...
call npx expo prebuild --platform android --clean

if errorlevel 1 (
    echo ERRO no prebuild!
    pause
    exit /b 1
)

REM Localizar Android SDK
echo [4/5] Localizando Android SDK...
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%" (
    set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
)

if not exist "%ANDROID_HOME%" (
    echo ERRO: Android SDK nao encontrado!
    pause
    exit /b 1
)

echo SDK encontrado: %ANDROID_HOME%
set "PATH=%ANDROID_HOME%\platform-tools;%PATH%"

REM BUILD com Gradle
echo [5/5] Compilando APK...
cd android
call gradlew.bat assembleRelease

cd ..

echo.
echo ================================================
echo BUILD COMPLETO!
echo ================================================
echo.

REM Copiar para Desktop
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo Copiando APK para Desktop...
    copy "android\app\build\outputs\apk\release\app-release.apk" "%USERPROFILE%\Desktop\BibliaSagrada.apk"
    echo.
    echo ================================================
    echo APK SALVO NO DESKTOP!
    echo ================================================
    echo.
    echo Arquivo: BibliaSagrada.apk
    echo Local: %USERPROFILE%\Desktop\
    echo.
    
    REM Listar emuladores
    echo Iniciando instalacao no emulador...
    "%ANDROID_HOME%\emulator\emulator.exe" -list-avds > emulators_temp.txt
    set /p EMULATOR_NAME=<emulators_temp.txt
    del emulators_temp.txt
    
    if not "%EMULATOR_NAME%"=="" (
        echo Emulador encontrado: %EMULATOR_NAME%
        echo Iniciando emulador...
        start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd %EMULATOR_NAME%
        
        echo Aguardando emulador iniciar...
        timeout /t 30 /nobreak
        
        "%ANDROID_HOME%\platform-tools\adb.exe" wait-for-device
        echo Instalando APK...
        "%ANDROID_HOME%\platform-tools\adb.exe" install -r "%USERPROFILE%\Desktop\BibliaSagrada.apk"
        
        echo.
        echo APP INSTALADO! Abrindo...
        "%ANDROID_HOME%\platform-tools\adb.exe" shell am start -n com.biblia.sagrada/.MainActivity
    )
) else (
    echo ERRO: APK nao encontrado!
    dir android\app\build\outputs\apk\
)

echo.
pause
