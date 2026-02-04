---
description: How to start the Nokia NOC Dashboard (Mobile & Web)
---

Follow these steps to start the full system. Ensure you have your local network IP ready (Current: `10.67.11.156`).

### 1. Start the Backend API
Open a new terminal and run:
```powershell
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
> [!NOTE]
> The `--host 0.0.0.0` is required so your mobile phone can find the API on your network.

### 2. Start the Frontend (Web & Mobile Sync)
Open a second terminal and run:
```powershell
cd frontend
npm run dev -- -H 10.67.11.156
```
> [!IMPORTANT]
> Use your actual computer IP (e.g. `10.67.11.156`). This allows the mobile app to connect to the dev server.

### 3. Launch the App
If you have a physical device or emulator connected:
```powershell
cd frontend
npx cap run android -l --external
```
Or simply open **Android Studio** and click the **Run** (▶️) button.

---
### 🛡️ Troubleshooting
- **White Screen?** Ensure the Frontend terminal is running and you entered the correct IP.
- **Backend Error?** Ensure Ollama is running in the background (`ollama serve`).
