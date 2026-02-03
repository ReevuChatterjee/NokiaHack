# Nokia Hackathon - Day 3 Demo Application

## Intelligent Fronthaul Network Optimization

This is a **complete, working, full-stack web application** that visualizes and presents the outputs of Day-1 and Day-2 analysis. This demo layer showcases network topology inference, traffic aggregation, and capacity optimization without performing any new modeling or computation.

---

## 🚀 Quick Start

### One-Click Startup

Simply double-click `start_all.bat` in the project root directory. This will:
1. Start the backend API server on `http://localhost:8000`
2. Start the frontend UI server on `http://localhost:3000`
3. Open two command windows (one for each server)

Wait a few seconds for both servers to initialize, then open your browser to:
```
http://localhost:3000
```

### Manual Startup

If you prefer to start servers individually:

**Backend:**
```bash
cd d:\Project2
start_backend.bat
```

**Frontend:**
```bash
cd d:\Project2
start_frontend.bat
```

---

## 📋 Prerequisites

### Required Software
- **Python 3.8+** (with pip)
- **Node.js 18+** (with npm)

### Verify Installation
```bash
python --version
node --version
npm --version
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                   http://localhost:3000                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   NEXT.JS FRONTEND                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📊 Overview Section                                  │   │
│  │  🌐 Topology Visualization                            │   │
│  │  🔥 Correlation Heatmap                               │   │
│  │  📈 Interactive Traffic Charts                        │   │
│  │  💾 Capacity Recommendations                          │   │
│  │  💡 Auto-Generated Insights                           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   FASTAPI BACKEND                            │
│                  http://localhost:8000                       │
│                                                              │
│  Endpoints:                                                  │
│    GET /api/topology                                         │
│    GET /api/correlation                                      │
│    GET /api/capacity-summary                                 │
│    GET /api/link-traffic?link_id={id}                        │
│    GET /api/images/{filename}                                │
│    GET /health                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ File System Access
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATA ARTIFACTS                             │
│                                                              │
│  📁 results/                                                 │
│    ├── topology.json                                         │
│    ├── correlation_matrix.csv                               │
│    └── 08_network_topology_graph.png                        │
│                                                              │
│  📁 artifacts/                                               │
│    ├── link_traffic_timeseries.csv                          │
│    ├── link_capacity_summary.csv                            │
│    ├── link_a_traffic.png                                   │
│    ├── link_b_traffic.png                                   │
│    └── link_c_traffic.png                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **Uvicorn** - Lightning-fast ASGI server
- **Pandas** - Efficient CSV parsing and data manipulation
- **CORS Middleware** - Cross-origin resource sharing for frontend

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **React 18** - Component-based UI library
- **Recharts** - Composable charting library for time-series visualization
- **Axios** - Promise-based HTTP client
- **Custom CSS** - Glassmorphism design with gradient effects

---

## 📊 Application Sections

### 1. Overview
- Problem statement explanation
- Three-phase approach summary
- Visual cards for each phase

### 2. Inferred Network Topology
- Display of topology graph visualization
- Table showing link-to-cell mappings
- Throughput statistics for each link

### 3. Packet-Loss Correlation Matrix
- Interactive SVG heatmap
- Color-coded correlation values (blue = low, red = high)
- Hover tooltips with precise correlation coefficients

### 4. Link Traffic Analysis
- Interactive link selector (Link_A, Link_B, Link_C)
- Responsive time-series line charts
- Real-time data loading per link
- Tooltips with precise traffic values

### 5. Capacity Recommendations
- Comprehensive comparison table
- Peak vs. average vs. P95 traffic metrics
- Capacity with/without buffering
- Percentage savings highlighted

### 6. Key Insights & Recommendations
- Auto-generated insights based on data:
  - Most congested link identification
  - Over-provisioning reduction percentage
  - Buffering benefits explanation
  - Topology discovery validation

---

## 📁 Project Structure

```
Project2/
├── backend/
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js        # Main dashboard
│   │   │   ├── layout.js      # Root layout
│   │   │   └── globals.css    # Global styles
│   │   └── components/
│   │       ├── CorrelationHeatmap.js
│   │       ├── TrafficChart.js
│   │       └── InsightsGenerator.js
│   ├── package.json
│   └── next.config.js
│
├── results/                    # Day-1 outputs
│   ├── topology.json
│   ├── correlation_matrix.csv
│   └── 08_network_topology_graph.png
│
├── artifacts/                  # Day-2 outputs
│   ├── link_traffic_timeseries.csv
│   ├── link_capacity_summary.csv
│   └── link_*_traffic.png
│
├── start_all.bat              # Start both servers
├── start_backend.bat          # Start backend only
├── start_frontend.bat         # Start frontend only
└── README_DAY3.md             # This file
```

---

## 🔍 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

### Endpoints

#### `GET /api/topology`
Returns the inferred fronthaul network topology.

**Response:**
```json
{
  "topology_version": "1.0",
  "links": {
    "Link_A": {
      "cells": [4, 5, 12, 20],
      "cell_count": 4,
      "avg_throughput_gbps": 0.53,
      ...
    }
  }
}
```

#### `GET /api/correlation`
Returns the packet-loss correlation matrix.

**Response:**
```json
{
  "cells": ["1", "2", "3", ...],
  "matrix": [[1.0, -0.007, ...], ...]
}
```

#### `GET /api/capacity-summary`
Returns link capacity summary with recommendations.

**Response:**
```json
[
  {
    "link_id": "Link_A",
    "avg_gbps": 4245.31,
    "peak_gbps": 21600.0,
    "capacity_no_buffer_gbps": 21600.0,
    "capacity_with_buffer_gbps": 13823.75
  }
]
```

#### `GET /api/link-traffic?link_id={id}`
Returns traffic time-series for a specific link.

**Parameters:**
- `link_id` (optional): Filter by link (Link_A, Link_B, or Link_C)

**Response:**
```json
[
  {
    "time_seconds": 1.00001,
    "link_id": "Link_A",
    "aggregated_gbps": 0.0
  },
  ...
]
```

#### `GET /api/images/{filename}`
Serves PNG images from results/artifacts directories.

**Example:**
```
http://localhost:8000/api/images/08_network_topology_graph.png
```

---

## 🐛 Troubleshooting

### Backend won't start
- **Ensure Python is installed**: `python --version`
- **Install dependencies manually**: 
  ```bash
  cd backend
  pip install -r requirements.txt
  ```
- **Check if port 8000 is in use**: Try a different port in `backend/main.py`

### Frontend won't start
- **Ensure Node.js is installed**: `node --version`
- **Install dependencies manually**:
  ```bash
  cd frontend
  npm install
  ```
- **Clear cache and reinstall**:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

### Frontend shows "Failed to load data"
- **Ensure backend is running** on `http://localhost:8000`
- **Check browser console** for CORS errors
- **Verify data files exist** in `results/` and `artifacts/` directories

### Charts not rendering
- **Check browser console** for JavaScript errors
- **Ensure Recharts is installed**: `cd frontend && npm ls recharts`
- **Try clearing browser cache**

---

## 🎯 Demo Presentation Checklist

Before presenting to judges:

- [ ] Run `start_all. bat` and verify both servers start successfully
- [ ] Open `http://localhost:3000` in a clean browser window
- [ ] Verify all 6 sections load with data
- [ ] Test the link selector in Traffic Analysis section
- [ ] Check that all images and charts render properly
- [ ] Prepare to explain the three-phase approach
- [ ] Highlight the capacity savings percentages
- [ ] Be ready to discuss the correlation heatmap interpretation

---

## 📝 Key Features for Judges

✅ **Read-Only Design** - No new modeling; purely a visualization layer  
✅ **Data-Driven** - All content dynamically loaded from Day-1/Day-2 artifacts  
✅ **One-Click Runnable** - Single command starts entire stack  
✅ **Professional UI** - Modern glassmorphism design with smooth animations  
✅ **Interactive Visualizations** - Heatmaps, time-series charts, dynamic tables  
✅ **Auto-Generated Insights** - Smart analysis of capacity savings  
✅ **Fully Documented** - Comprehensive API docs and README  

---

## 👥 Support

For issues or questions during the hackathon, check:
1. Browser console (F12) for frontend errors
2. Backend terminal for API errors
3. This README troubleshooting section

---

**Built with ❤️ for Nokia Hackathon 2026**
