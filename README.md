# Intelligent Fronthaul Optimization Dashboard 🚀

A real-time, AI-powered dashboard for monitoring, analyzing, and optimizing 5G fronthaul network traffic. This project was developed for the Nokia Hackathon, now featuring a fully functional **Android Native App**.

![Dashboard Preview](frontend/public/nokia-icon.png)

## 🌟 Key Features

- **Real-Time Traffic Monitoring**: Visualizes live traffic loads across network links with dynamic charts (`Recharts`).
- **Interactive 3D Topology**: Explorable 3D network graph showing the relationship between cells and links (`react-force-graph-3d`).
- **Correlation Analysis**: Heatmap with responsive **Mobile Overlay Panels** for deep-dive cell insights.
- **AI Assistant Integration**: Built-in chat interface powered by **local LLaMA 3** (via Ollama) to analyze network data contextually.
- **Native Mobile App**: Built with Capacitor, featuring custom **Adaptive Icons**, dark-mode splash screens, and native navigation.
- **Responsive Design**: Fluid transitions between "Hacker HUD" desktop view and mobile-optimized layouts.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Mobile**: [Capacitor 6](https://capacitorjs.com/) (Android)
- **Styling**: Vanilla CSS with Glassmorphism
- **Visualization**: Recharts, React-Force-Graph-3D, HTML5 Canvas
- **Animations**: Framer Motion

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Processing**: Pandas, NumPy, NetworkX, Scikit-learn
- **AI Integration**: Ollama LLM Proxy

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- [Ollama](https://ollama.com/) installed and running
- **Android Studio** (for mobile deployment)

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```
Start the backend server (using `0.0.0.0` is essential for mobile access):
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

**Mobile Connectivity Tip:**
Find your computer's local IP (e.g., `10.67.11.156`) and update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://10.67.11.156:8000
```

Start the development server:
```bash
npm run dev -- -H 10.67.11.156
```

---

## 📱 Mobile App Guide

The dashboard is optimized for mobile with a native bottom navigation bar and touch-optimized graphs.

### Quick Start
1. **Sync Web Build**: `cd frontend && npm run export && npx cap sync`
2. **Open Android Studio**: `npx cap open android`
3. **Run**: Click the Play button (▶️) in Android Studio.

**Features:**
- ✅ **Adaptive Icons**: Branded Nokia NOC icon that adapts to your device theme.
- ✅ **Insights Overlay**: Heatmap details appear as a sleek bottom sheet on touch.
- ✅ **Native Nav**: Rapid switching between Graphs, Heatmaps, and AI Assistant.

For detailed build instructions, see [MOBILE_BUILD.md](MOBILE_BUILD.md).

---

## 📂 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI Application (API & AI Logic)
│   └── test_api.py          # Backend validation scripts
├── frontend/
│   ├── android/             # Native Android project folder
│   ├── src/components/      # Mobile-aware UI components
│   ├── src/app/page.js      # Main Dashboard logic
│   └── capacitor.config.ts  # Native App configuration
├── MOBILE_BUILD.md          # Step-by-step mobile build guide
└── README.md                # Project Overview
```

## 🤝 Contributing
Developed for the Nokia Hackathon. Special thanks to the team for the "Intelligent Fronthaul" challenge!

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)

