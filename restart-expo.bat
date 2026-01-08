@echo off
echo.
echo ================================================
echo  Reiniciando Expo com Cache Limpo
echo ================================================
echo.

echo [1/3] Parando processos Expo existentes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *expo*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Limpando cache do Metro...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo.
echo [3/3] Iniciando Expo com cache limpo...
echo.
echo ================================================
echo  Servidor Iniciando - Aguarde...
echo ================================================
echo.

npx expo start --clear

pause
