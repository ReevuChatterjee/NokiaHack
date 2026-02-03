from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import json
from pathlib import Path

app = FastAPI(title="Nokia Hackathon Day-3 API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base paths for data files
BASE_DIR = Path(__file__).parent.parent
RESULTS_DIR = BASE_DIR / "results"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# Cache for loaded data
_data_cache = {}


def load_json_file(filepath: Path):
    """Load JSON file with caching"""
    cache_key = str(filepath)
    if cache_key not in _data_cache:
        with open(filepath, 'r') as f:
            _data_cache[cache_key] = json.load(f)
    return _data_cache[cache_key]


def load_csv_to_json(filepath: Path):
    """Load CSV file and convert to JSON with caching"""
    cache_key = str(filepath)
    if cache_key not in _data_cache:
        df = pd.read_csv(filepath)
        _data_cache[cache_key] = df.to_dict(orient='records')
    return _data_cache[cache_key]


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Nokia Hackathon Day-3 API",
        "version": "1.0.0",
        "endpoints": [
            "/api/topology",
            "/api/correlation",
            "/api/capacity-summary",
            "/api/link-traffic",
            "/api/images/{filename}",
            "/health"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api/topology")
async def get_topology():
    """
    Returns the inferred fronthaul network topology.
    
    Returns:
        JSON object with topology structure including links and their cells
    """
    try:
        topology_file = RESULTS_DIR / "topology.json"
        if not topology_file.exists():
            raise HTTPException(status_code=404, detail="Topology file not found")
        
        return load_json_file(topology_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading topology: {str(e)}")


@app.get("/api/correlation")
async def get_correlation():
    """
    Returns the packet-loss correlation matrix.
    
    Returns:
        JSON array with correlation data for all cells
    """
    try:
        correlation_file = RESULTS_DIR / "correlation_matrix.csv"
        if not correlation_file.exists():
            raise HTTPException(status_code=404, detail="Correlation file not found")
        
        # Load correlation matrix and convert to proper format
        df = pd.read_csv(correlation_file, index_col=0)
        
        # Return as matrix format for heatmap
        return {
            "cells": df.columns.tolist(),
            "matrix": df.values.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading correlation: {str(e)}")


@app.get("/api/capacity-summary")
async def get_capacity_summary():
    """
    Returns link capacity summary with recommendations.
    
    Returns:
        JSON array with capacity metrics for each link
    """
    try:
        capacity_file = ARTIFACTS_DIR / "link_capacity_summary.csv"
        if not capacity_file.exists():
            raise HTTPException(status_code=404, detail="Capacity summary file not found")
        
        return load_csv_to_json(capacity_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading capacity summary: {str(e)}")


@app.get("/api/link-traffic")
async def get_link_traffic(link_id: str = None):
    """
    Returns link traffic time-series data.
    
    Args:
        link_id: Optional filter for specific link (Link_A, Link_B, or Link_C)
    
    Returns:
        JSON array with traffic time-series data
    """
    try:
        traffic_file = ARTIFACTS_DIR / "link_traffic_timeseries.csv"
        if not traffic_file.exists():
            raise HTTPException(status_code=404, detail="Traffic data file not found")
        
        df = pd.read_csv(traffic_file)
        
        # Filter by link_id if provided
        if link_id:
            df = df[df['link_id'] == link_id]
            if df.empty:
                raise HTTPException(status_code=404, detail=f"No data found for link: {link_id}")
        
        return df.to_dict(orient='records')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading traffic data: {str(e)}")


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """
    Serves image files from the results directory.
    
    Args:
        filename: Name of the image file (e.g., '08_network_topology_graph.png')
    
    Returns:
        Image file
    """
    try:
        # Security: Only allow PNG files
        if not filename.endswith('.png'):
            raise HTTPException(status_code=400, detail="Only PNG files are allowed")
        
        # Check in results directory
        image_path = RESULTS_DIR / filename
        if not image_path.exists():
            # Also check in artifacts directory
            image_path = ARTIFACTS_DIR / filename
            if not image_path.exists():
                raise HTTPException(status_code=404, detail="Image not found")
        
        return FileResponse(image_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
