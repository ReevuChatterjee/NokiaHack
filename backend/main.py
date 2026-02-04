from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import json
import shutil
from pathlib import Path
import httpx
from pydantic import BaseModel
from typing import List, Optional


app = FastAPI(title="Nokia Hackathon Day-3 API", version="1.0.0")

# Trigger reload

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

# Define critical files to backup/restore
CRITICAL_FILES = [
    (RESULTS_DIR / "topology.json"),
    (RESULTS_DIR / "correlation_matrix.csv"),
    (ARTIFACTS_DIR / "link_capacity_summary.csv"),
    (ARTIFACTS_DIR / "link_traffic_timeseries.csv")
]

# Create backups on startup if they don't exist
for file_path in CRITICAL_FILES:
    backup_path = file_path.with_name(f"{file_path.stem}_original{file_path.suffix}")
    if file_path.exists() and not backup_path.exists():
        shutil.copy2(file_path, backup_path)
        print(f"Created backup: {backup_path.name}")

@app.post("/api/reset")
async def reset_data():
    """Restores the original datasets from backup files."""
    try:
        restored_count = 0
        for file_path in CRITICAL_FILES:
            backup_path = file_path.with_name(f"{file_path.stem}_original{file_path.suffix}")
            if backup_path.exists():
                shutil.copy2(backup_path, file_path)
        # 3. Clear all caches to ensure UI sync
        _data_cache.clear()
        
        return {"status": "success", "message": f"System reset complete. Restored {restored_count} files."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")



@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a user-uploaded traffic CSV, processes it, and updates system analysis.
    Expected Schema: time_seconds, link_id, aggregated_gbps
    """
    try:
        # 1. Save File
        upload_path = ARTIFACTS_DIR / f"user_upload_{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Load Data
        df = pd.read_csv(upload_path)
        required_cols = {"time_seconds", "link_id", "aggregated_gbps"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")

        # 3. Process Capacity Summary
        # Group by LinkID and calculate stats
        capacity_stats = df.groupby('link_id')['aggregated_gbps'].agg(['mean', 'max', lambda x: x.quantile(0.95)]).reset_index()
        capacity_stats.columns = ['link_id', 'avg_gbps', 'peak_gbps', 'p95_gbps']
        
        # Simple buffer logic
        def calc_buffer(row):
            burstiness = row['peak_gbps'] / (row['avg_gbps'] + 0.001)
            savings_factor = 0.2 if burstiness > 1.5 else 0.05
            return row['peak_gbps'] * (1 - savings_factor)

        capacity_stats['capacity_no_buffer_gbps'] = capacity_stats['peak_gbps'] * 1.1 # 10% headroom
        capacity_stats['capacity_with_buffer_gbps'] = capacity_stats.apply(calc_buffer, axis=1) * 1.1
        
        # Save Capacity CSV
        capacity_stats.to_csv(ARTIFACTS_DIR / "link_capacity_summary.csv", index=False)
        _data_cache.pop(str(ARTIFACTS_DIR / "link_capacity_summary.csv"), None)

        # 4. Process Correlation Matrix
        # Pivot: Time vs Link
        pivot_df = df.pivot_table(index='time_seconds', columns='link_id', values='aggregated_gbps', fill_value=0)
        corr_matrix = pivot_df.corr().fillna(0)
        
        # Save Correlation CSV
        corr_matrix.to_csv(RESULTS_DIR / "correlation_matrix.csv")
        _data_cache.pop(str(RESULTS_DIR / "correlation_matrix.csv"), None)

        # 5. Process Topology (Inference)
        unique_links = df['link_id'].unique()
        topology = {"links": {}}
        
        for link_id in unique_links:
            # Ensure link_id is string
            l_id = str(link_id)
            topology["links"][l_id] = {
                "cells": [f"{l_id}_cell_{i}" for i in range(1, 4)],
                "cell_count": 3,
                "avg_throughput_mbps": float(capacity_stats[capacity_stats['link_id'] == link_id]['avg_gbps'].iloc[0] * 1000),
                "peak_throughput_mbps": float(capacity_stats[capacity_stats['link_id'] == link_id]['peak_gbps'].iloc[0] * 1000),
                "estimated_utilization": 0.5
            }

        with open(RESULTS_DIR / "topology.json", "w") as f:
            json.dump(topology, f, indent=2)
        _data_cache.pop(str(RESULTS_DIR / "topology.json"), None)

        # 6. Save Raw Traffic for Charts
        df.to_csv(ARTIFACTS_DIR / "link_traffic_timeseries.csv", index=False)
        _data_cache.pop(str(ARTIFACTS_DIR / "link_traffic_timeseries.csv"), None)

        # 6. Clear Cache
        _data_cache.clear()
        
        return {"status": "success", "message": "Data processed. Dashboard updated.", "details": f"Processed {len(unique_links)} links."}

    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        
        # Fix Infinity/NaN values which are not JSON compliant
        data = load_json_file(topology_file)
        return fix_json_values(data)
    except Exception as e:
        print(f"Topology API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading topology: {str(e)}")


def load_csv(filepath: Path):
    """Load CSV file with caching"""
    cache_key = f"df_{filepath}"
    if cache_key not in _data_cache:
        _data_cache[cache_key] = pd.read_csv(filepath)
    return _data_cache[cache_key]


def fix_json_values(obj):
    import math
    if isinstance(obj, dict):
        return {k: fix_json_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_json_values(item) for item in obj]
    elif isinstance(obj, float) and (math.isinf(obj) or math.isnan(obj)):
        return None  # Convert Infinity/NaN to null
    return obj


@app.get("/api/correlation")
async def get_correlation():
    try:
        df = load_csv(RESULTS_DIR / "correlation_matrix.csv")
        # Handle cases where the first column is the link/cell IDs
        if "link_id" in df.columns:
            cells = df["link_id"].astype(str).tolist()
            matrix = df.drop(columns=["link_id"]).values.tolist()
        elif df.columns[0] == "Unnamed: 0":
            cells = df.iloc[:, 0].astype(str).tolist()
            matrix = df.iloc[:, 1:].values.tolist()
        else:
            cells = df.columns.astype(str).tolist()
            matrix = df.values.tolist()
             
        return fix_json_values({"cells": cells, "matrix": matrix})
    except Exception as e:
        print(f"Correlation API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    Returns time-series traffic data for a specific link or all links.
    """
    try:
        timeseries_file = ARTIFACTS_DIR / "link_traffic_timeseries.csv"
        if not timeseries_file.exists():
            raise HTTPException(status_code=404, detail="Traffic timeseries file not found")
        
        df = load_csv(timeseries_file)
        
        if link_id:
            link_data = df[df['link_id'] == link_id]
            if link_data.empty:
                # Fallback: maybe it's mixed case or has different name
                link_data = df[df['link_id'].astype(str).str.contains(link_id, case=False)]
            
            return link_data.to_dict(orient='records')
        
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Traffic API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "llama3"
    context_data: Optional[dict] = None

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Chat endpoint that forwards context-aware prompts to a local Ollama instance.
    """
    try:
        # Construct system prompt with context
        system_prompt = (
            "You are an expert Network Operations Center (NOC) AI assistant for Nokia. "
            "Your goal is to help engineers optimize fronthaul networks. "
            "Keep answers concise, technical, and actionable. "
        )
        
        if request.context_data:
            system_prompt += f"\n\nCURRENT SYSTEM CONTEXT:\n{json.dumps(request.context_data, indent=2)}"

        # Prepare messages for Ollama
        ollama_messages = [{"role": "system", "content": system_prompt}]
        for msg in request.messages:
            ollama_messages.append({"role": msg.role, "content": msg.content})

        # Call Ollama API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://127.0.0.1:11434/api/chat",
                    json={
                        "model": request.model,
                        "messages": ollama_messages,
                        "stream": False
                    },
                    timeout=60.0 # Longer timeout for LLM inference
                )
                response.raise_for_status()
                result = response.json()
                
                return {
                    "role": "assistant",
                    "content": result.get("message", {}).get("content", "Error: No response from model.")
                }
            except httpx.ConnectError:
                raise HTTPException(status_code=503, detail="Could not connect to Ollama (127.0.0.1:11434). Is it running?")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
