@echo off
TITLE Generation du fichier d'installation .EXE - GMAO STA Chery
COLOR 0A
cls

echo =======================================================================
echo          STA CHERY TUNISIE - GENERATEUR D'APPLICATION .EXE (SETUP)
echo =======================================================================
echo.
echo Ce script va installer Electron et Electron-Builder pour compiler 
echo l'application GMAO sous forme de fichier d'installation Windows (.exe).
echo.
echo Veuillez patienter pendant la preparation...
echo.

:: 1. Verification de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERREUR] Node.js n'est pas installe sur votre PC Windows.
    echo Veuillez telecharger et installer Node.js depuis https://nodejs.org/
    echo puis relancer ce fichier .bat.
    echo.
    pause
    exit /b
)

echo [1/4] Installation des dependances locales...
call npm install

echo.
echo [2/4] Installation d'Electron et Electron-Builder...
call npm install --save-dev electron electron-builder

echo.
echo [3/4] Compilation des fichiers web (Vite Build)...
call npm run build

echo.
echo [4/4] Generation du fichier d'installation Windows .EXE...
call npx electron-builder --win nsis --config.extraMetadata.main=electron-main.js

echo.
echo =======================================================================
if exist "dist\*.exe" (
    COLOR 0A
    echo [SUCCES] Le fichier d'installation .exe a ete genere avec succes !
    echo.
    echo Vous trouverez le fichier d'installation dans le dossier :
    echo --^>  dist\  (ex: GMAO STA Chery Setup 1.0.0.exe)
    echo.
    echo Vous pouvez double-cliquer sur ce fichier .exe pour installer 
    echo l'application sur n'importe quel ordinateur Windows.
) else (
    echo [INFO] La compilation est terminee. Verifiez le dossier 'dist' pour trouver le fichier .exe.
)
echo =======================================================================
echo.
pause
