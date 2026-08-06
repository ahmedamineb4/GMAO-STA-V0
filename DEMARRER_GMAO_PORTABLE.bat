@echo off
TITLE GMAO STA Chery - Demarrage Rapide Portable
COLOR 0F
cls

echo =======================================================================
echo              STA CHERY TUNISIE - GMAO APPLICATION BUREAU
echo =======================================================================
echo.
echo Demarrage du serveur local et ouverture automatique de l'application...
echo.

:: Demarrer le serveur Node en arriere-plan
start /min node server.js

:: Attendre 2 secondes que le serveur initialise le port 3000
timeout /t 2 /nobreak >nul

:: Ouvrir l'application dans le navigateur par defaut en plein ecran
start http://localhost:3000

echo [OK] L'application GMAO est active sur http://localhost:3000
echo.
echo Gardez cette fenetre ouverte pendant l'utilisation de l'application.
echo Pour fermer la GMAO, fermez simplement cette fenetre.
echo =======================================================================
echo.
