@echo off
title Demarrage de l'Application React
cls

:: 1. Vérification si le fichier est exécuté depuis un ZIP non extrait
echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul
if %errorlevel% == 0 (
    echo ======================================================================
    echo [ERREUR] Ne lancez pas ce fichier directement depuis le fichier ZIP !
    echo ======================================================================
    echo Veuillez d'abord extraire (dezipper) TOUS les fichiers dans un dossier
    echo normal sur votre ordinateur (par exemple sur votre Bureau).
    echo.
    pause
    exit
)

cd /d "%~dp0"

:: 2. Vérification si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ======================================================================
    echo [ERREUR] Node.js n'est pas installe sur votre ordinateur !
    echo ======================================================================
    echo Cette application a besoin de Node.js pour tourner sur votre PC.
    echo Veuillez le telecharger et l'installer (version LTS recommandee) sur :
    echo https://nodejs.org/
    echo.
    echo Une fois installe, fermez cette fenetre et double-cliquez a nouveau sur ce fichier.
    echo.
    pause
    exit
)

:: 3. Installation automatique des dépendances (npm install)
if not exist "node_modules\" (
    echo ======================================================================
    echo [INFO] Premier lancement detecte ! Installation des composants...
    echo ======================================================================
    echo Cette etape ne se produit qu'une seule fois. Veuillez patienter...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERREUR] L'installation des composants a echoue.
        echo Verifiez que vous etes bien connecte a Internet et reessayez.
        echo.
        pause
        exit
    )
    echo.
    echo [SUCCES] Installation terminee !
    echo.
)

:: 4. Lancement du serveur local
echo ======================================================================
echo [INFO] Demarrage du serveur de l'application en cours...
echo ======================================================================
echo.
echo Une fois demarre, l'application sera accessible dans votre navigateur :
echo -> http://localhost:3000
echo.
echo Pour arreter l'application, fermez simplement cette fenetre.
echo ----------------------------------------------------------------------
echo.

call npm run dev

pause
