@echo off
echo ================================================
echo Nokia Hackathon - Day 3 Demo Application
echo ================================================
echo.
echo Starting both backend and frontend servers...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in either window to stop that server
echo.

echo Starting backend server in new window...
start "Nokia Hackathon - Backend" cmd /k "%~dp0start_backend.bat"

timeout /t 3 /nobreak >nul

echo Starting frontend server in new window...
start "Nokia Hackathon - Frontend" cmd /k "%~dp0start_frontend.bat"

echo.
echo ================================================
echo Both servers are starting!
echo ================================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI:  http://localhost:3000
echo.
echo Wait a few seconds for servers to initialize,
echo then open http://localhost:3000 in your browser.
echo.
pause
