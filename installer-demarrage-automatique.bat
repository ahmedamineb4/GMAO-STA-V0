@echo off
title GMAO STA CHERY - Configuration du Demarrage Automatique au boot du PC
color 0A

echo ======================================================================
echo  CONFIGURATEUR DE DEMARRAGE AUTOMATIQUE AU BOOT DU PC
echo  GMAO STA CHERY TUNISIE
echo ======================================================================
echo.
echo Ce script va configurer Windows pour que l'application GMAO se lance
echo automatiquement a CHAQUE DEMARRAGE / ALLUMAGE de votre ordinateur.
echo.
echo L'application reservera automatiquement le port 3000 et restera accessible
echo sur le reseau local (LAN) pour tous vos collegues dès le boot du PC.
echo.

set "SHORTCUT_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\GMAO_STA_CHERY.lnk"
set "TARGET_PATH=%~dp0demarrer.bat"
set "WORKING_DIR=%~dp0"

echo [INFO] Creation du raccourci dans le dossier Demarrage automatique de Windows...
echo.

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_PATH%'; $s.WorkingDirectory = '%WORKING_DIR%'; $s.Description = 'Lancement automatique GMAO STA CHERY'; $s.Save()"

if exist "%SHORTCUT_PATH%" (
    echo ======================================================================
    echo  [SUCCES] Demarrage automatique configure avec succes !
    echo ======================================================================
    echo.
    echo  - L'application GMAO se lancera automatiquement a chaque allumage du PC.
    echo  - L'adresse http://localhost:3000 sera reservee et active en permanence.
    echo  - Vos collegues pourront s'y connecter sur le reseau local (ex: http://192.168.x.x:3000).
    echo.
) else (
    echo ======================================================================
    echo  [ERREUR] Impossible de creer le raccourci de demarrage automatique.
    echo ======================================================================
    echo  Veuillez verifier les autorisations ou executer ce script en tant qu'Administrateur.
    echo.
)

pause
