@echo off
title UNIVERSE AI - Local AI Chatbot
color 0A

echo.
echo ==========================================
echo             UNIVERSE AI CHATBOT
echo       Local AI - Ollama + FastAPI
echo ==========================================
echo.

REM ------------------------------------------
REM Check Ollama
REM ------------------------------------------

echo [1/4] Checking Ollama...

where ollama >nul 2>&1

if errorlevel 1 (
    echo.
    echo ERROR: Ollama is not installed
    echo.
    pause
    exit /b 1
)

echo Ollama found.
echo.


REM ------------------------------------------
REM Start Ollama
REM ------------------------------------------

echo [2/4] Starting Ollama...

start "" ollama serve

timeout /t 3 /nobreak >nul

echo Ollama started.
echo.


REM ------------------------------------------
REM Go to Backend
REM ------------------------------------------

echo [3/4] Starting FastAPI backend...

cd /d "%~dp0backend"

if not exist "main.py" (
    echo.
    echo ERROR: main.py not found!
    echo Backend folder check karo.
    echo.
    pause
    exit /b 1
)

start "UNIVERSE AI BACKEND" powershell -NoExit -Command "cd '%~dp0backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 5 /nobreak >nul


REM ------------------------------------------
REM Open Browser
REM ------------------------------------------

echo [4/4] Opening Universe AI...

start "" "http://127.0.0.1:8000"

echo.
echo ==========================================
echo          UNIVERSE AI IS RUNNING
echo ==========================================
echo.
echo Website:
echo http://127.0.0.1:8000
echo.
echo Do not close the backend window.
echo.
echo ==========================================

pause