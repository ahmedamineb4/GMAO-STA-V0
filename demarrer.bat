@echo off
title Demarrage de l'Application React
cls

:: 1. Verification si le fichier est execute depuis un ZIP non extrait
echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul
if %errorlevel% EQU 0 goto ERROR_ZIP

:: 2. Verification si Node.js est installe
where node >nul 2>nul
if %errorlevel% NEQ 0 goto ERROR_NODE

:: 3. Installation automatique des dependances (npm install)
if exist "node_modules\" goto START_APP

echo ======================================================================
echo [INFO] Premier lancement detecte ! Installation des composants...
echo ======================================================================
echo Cette etape ne se produit qu'une seule fois. Veuillez patienter...
echo.
call npm install
if %errorlevel% NEQ 0 goto ERROR_INSTALL
echo.
echo [SUCCES] Installation terminee !
echo.

:START_APP
:: 4. Lancement du serveur local
echo ======================================================================
echo [INFO] Demarrage du serveur de l'application en cours...
echo ======================================================================
echo.
echo Une fois demarre, l'application sera accessible dans votre navigateur :
echo --^> http://localhost:3000
echo.
echo Pour arreter l'application, fermez simplement cette fenetre.
echo ----------------------------------------------------------------------
echo.

call npm run dev
if %errorlevel% NEQ 0 goto ERROR_RUN
pause
exit

:ERROR_ZIP
echo ======================================================================
echo [ERREUR] Ne lancez pas ce fichier directement depuis le fichier ZIP !
echo ======================================================================
echo Veuillez d'abord extraire (dezipper) TOUS les fichiers dans un dossier
echo normal sur votre ordinateur (par exemple sur votre Bureau).
echo.
pause
exit

:ERROR_NODE
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

:ERROR_INSTALL
echo.
echo ======================================================================
echo [ERREUR] L'installation des composants a echoue.
echo ======================================================================
echo Verifiez que vous etes bien connecte a Internet et reessayez.
echo.
pause
exit

:ERROR_RUN
echo.
echo ======================================================================
echo [ERREUR] Impossible de lancer le serveur de developpement.
echo ======================================================================
echo Verifiez les erreurs ci-dessus.
echo.
pause
exit
