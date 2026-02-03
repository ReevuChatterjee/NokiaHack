"""
Simple test script to verify backend endpoints are working correctly.
Run this after starting the backend server.
"""
import requests
import sys

API_BASE = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health")
        assert response.status_code == 200
        print("✓ Health endpoint: PASS")
        return True
    except Exception as e:
        print(f"✗ Health endpoint: FAIL - {e}")
        return False

def test_topology():
    """Test topology endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/topology")
        assert response.status_code == 200
        data = response.json()
        assert "links" in data
        print(f"✓ Topology endpoint: PASS ({len(data['links'])} links found)")
        return True
    except Exception as e:
        print(f"✗ Topology endpoint: FAIL - {e}")
        return False

def test_correlation():
    """Test correlation endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/correlation")
        assert response.status_code == 200
        data = response.json()
        assert "cells" in data
        assert "matrix" in data
        print(f"✓ Correlation endpoint: PASS ({len(data['cells'])} cells)")
        return True
    except Exception as e:
        print(f"✗ Correlation endpoint: FAIL - {e}")
        return False

def test_capacity_summary():
    """Test capacity summary endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/capacity-summary")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Capacity summary endpoint: PASS ({len(data)} links)")
        return True
    except Exception as e:
        print(f"✗ Capacity summary endpoint: FAIL - {e}")
        return False

def test_link_traffic():
    """Test link traffic endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/link-traffic?link_id=Link_A")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Link traffic endpoint: PASS ({len(data)} data points)")
        return True
    except Exception as e:
        print(f"✗ Link traffic endpoint: FAIL - {e}")
        return False

def test_image():
    """Test image serving endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/images/08_network_topology_graph.png")
        assert response.status_code == 200
        assert response.headers['content-type'].startswith('image/')
        print("✓ Image serving endpoint: PASS")
        return True
    except Exception as e:
        print(f"✗ Image serving endpoint: FAIL - {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Nokia Hackathon Backend API Tests")
    print("=" * 60)
    print()
    
    tests = [
        test_health,
        test_topology,
        test_correlation,
        test_capacity_summary,
        test_link_traffic,
        test_image
    ]
    
    results = [test() for test in tests]
    
    print()
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    sys.exit(0 if all(results) else 1)
