@echo off
title GMAO STA CHERY - Desactivation du Demarrage Automatique
color 0C

echo ======================================================================
echo  DESACTIVATION DU DEMARRAGE AUTOMATIQUE
echo  GMAO STA CHERY TUNISIE
echo ======================================================================
echo.

set "SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\GMAO_STA_CHERY.lnk"

if exist "%SHORTCUT_PATH%" (
    del "%SHORTCUT_PATH%"
    echo [SUCCES] Le demarrage automatique de la GMAO a ete desactive avec succes.
    echo L'application ne se lancera plus automatiquement au boot de Windows.
) else (
    echo [INFO] Aucun demarrage automatique n'etait active.
)

echo.
pause
