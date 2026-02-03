@echo off
echo ================================================
echo Nokia Hackathon - Starting Frontend Server
echo ================================================
echo.

cd /d "%~dp0frontend"

echo Checking Node.js dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo Starting Next.js development server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev
