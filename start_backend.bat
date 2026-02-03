@echo off
echo ================================================
echo Nokia Hackathon - Starting Backend Server
echo ================================================
echo.

cd /d "%~dp0backend"

echo Checking Python dependencies...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
) else (
    echo Dependencies already installed.
)

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
