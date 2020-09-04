@echo off

set DIR=%~dp0
set VENV=%DIR%.env

if not exist "%VENV%" (
    echo [Initial environment]
    python -m venv "%VENV%"
    echo.
)

if not exist "%VENV%\Scripts\pyinstaller.exe" (
    echo [Install requirements]
    "%VENV%\Scripts\python.exe" -m pip install -r requirements.txt
    echo.
)

echo [Generate binary]
"%VENV%\Scripts\pyinstaller.exe" --onefile "%DIR%main.spec"
echo.

explorer /select,"%DIR%dist\furegame.exe"
timeout /T 10
