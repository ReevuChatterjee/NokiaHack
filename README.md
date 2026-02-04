# Intelligent Fronthaul Optimization Dashboard 🚀

A real-time, AI-powered dashboard for monitoring, analyzing, and optimizing 5G fronthaul network traffic. This project was developed for the Nokia Hackathon.

![Dashboard Preview](frontend/public/preview.png)
*(Note: Add a screenshot of your dashboard here if available)*

## 🌟 Key Features

- **Real-Time Traffic Monitoring**: Visualizes live traffic loads across network links with dynamic charts (`Recharts`).
- **Interactive 3D Topology**: Explorable 3D network graph showing the relationship between cells and links (`react-force-graph-3d`).
- **Correlation Analysis**: Heatmap and circular chord diagrams to identify traffic correlation between cells.
- **AI Assistant Integration**: Built-in chat interface powered by **local LLaMA 3** (via Ollama) to analyze network data and answer queries contextually.
- **Capacity Planning**: Automated buffer analysis and capacity recommendations.
- **Responsive Design**: Fully optimized for Desktop and Mobile viewing.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Mobile**: [Capacitor](https://capacitorjs.com/) for iOS/Android
- **Styling**: CSS Modules, Glassmorphism UI
- **Visualization**: Recharts, React-Force-Graph-3D, HTML5 Canvas
- **Animations**: Framer Motion

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Processing**: Pandas, NumPy, NetworkX
- **AI Integration**: Ollama (Client-side proxy via FastAPI)

### AI Model
- **Engine**: [Ollama](https://ollama.com/)
- **Model**: LLaMA 3 (Running locally)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- [Ollama](https://ollama.com/) installed and running

### 1. Clone the Repository
```bash
git clone https://github.com/ReevuChatterjee/NokiaHack.git
cd NokiaHack
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```
Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
# or
yarn install
```
Start the development server:
```bash
npm run dev
```
> The dashboard will be accessible at `http://localhost:3000`.

### 4. AI Setup (Ollama)
Ensure Ollama is running and pull the LLaMA 3 model:
```bash
ollama serve
ollama pull llama3
```
> The backend connects to Ollama at `http://127.0.0.1:11434`.

---

## 📊 Usage

1. **Dashboard Home**: View the network topology and active KPIs.
2. **Upload Data**: Use the upload button to ingest new traffic CSV files.
3. **AI Chat**: Open the "AI Assistant" panel to ask questions like *"Which link is congested?"* or *"Analyze traffic patterns for Link A"*.
4. **Mobile View**: Access the dashboard on your phone for a responsive monitoring experience.

---

## 📱 Mobile App

The dashboard is also available as a native mobile app for Android and iOS, powered by Capacitor.

### Quick Start
```bash
cd frontend
npm install
npm run export
npx cap add android    # For Android
npx cap open android   # Opens in Android Studio
```

**For detailed instructions**, see [MOBILE_BUILD.md](MOBILE_BUILD.md).

### Features
- ✅ Native Android and iOS support
- ✅ Optimized mobile UI with touch-friendly controls
- ✅ Safe area support for notched devices
- ✅ Dark mode status bar integration
- ✅ Network connectivity detection
- ✅ Responsive layouts for all screen sizes

---

## 📂 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI Application & Endpoints
│   ├── requirements.txt     # Python Dependencies
│   └── ...
├── frontend/
│   ├── src/components/      # React Components (Charts, Graphs, Chat)
│   ├── src/app/page.js      # Main Dashboard View
│   └── ...
├── artifacts/               # Generated data files (traffic, capacity)
├── generate_mock_data.py    # Script to generate synthetic test data
└── README.md                # Project Documentation
```

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
