@echo off
rem Bureau de publication : ouvre ensuite http://<ip-du-pc>:4173 dans Safari sur l'iPhone (meme Wi-Fi).
cd /d "%~dp0"
call npm run front
pause
