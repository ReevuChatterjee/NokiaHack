'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import TrafficChart from '../components/TrafficChart';
import InsightsGenerator from '../components/InsightsGenerator';
import CapacityTable from '../components/CapacityTable';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Dynamically import network graphs
const NetworkGraph2D = dynamic(() => import('../components/NetworkGraph3D'), {
    ssr: false,
    loading: () => <LoadingSkeleton type="chart" />
});

const CorrelationNetwork = dynamic(() => import('../components/CorrelationNetwork'), {
    ssr: false,
    loading: () => <LoadingSkeleton type="chart" />
});

const API_BASE_URL = 'http://localhost:8000';

export default function Home() {
    const [topology, setTopology] = useState(null);
    const [correlation, setCorrelation] = useState(null);
    const [capacitySummary, setCapacitySummary] = useState(null);
    const [trafficData, setTrafficData] = useState(null);
    const [selectedLink, setSelectedLink] = useState('Link_A');
    const [correlationView, setCorrelationView] = useState('network');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedLink) {
            fetchTrafficData(selectedLink);
        }
    }, [selectedLink]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [topologyRes, correlationRes, capacityRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/topology`),
                axios.get(`${API_BASE_URL}/api/correlation`),
                axios.get(`${API_BASE_URL}/api/capacity-summary`)
            ]);

            setTopology(topologyRes.data);
            setCorrelation(correlationRes.data);
            setCapacitySummary(capacityRes.data);
            await fetchTrafficData('Link_A');
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load system data.');
            setLoading(false);
        }
    };

    const fetchTrafficData = async (linkId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/link-traffic?link_id=${linkId}`);
            setTrafficData(response.data);
        } catch (err) {
            console.error(`Error fetching traffic data for ${linkId}:`, err);
        }
    };

    if (loading) return <div className="loading-overlay"><div className="loading">Initializing Dashboard...</div></div>;
    if (error) return <div className="loading-overlay"><div className="error">{error}</div></div>;

    // Calculate simple KPIs
    const totalLinks = topology ? Object.keys(topology.links).length : 0;
    const totalCells = correlation ? correlation.cells.length : 0;
    const avgUtilization = (capacitySummary && capacitySummary.length > 0)
        ? capacitySummary.reduce((acc, curr) => {
            // Check for correct property names from CSV (likely 'avg_mbps' vs 'avg_throughput_mbps')
            // Using flexible access or based on confirmed CSV headers
            const avg = parseFloat(curr.avg_gbps || curr.avg_mbps || 0);
            const peak = parseFloat(curr.peak_gbps || curr.peak_mbps || 1); // Avoid div by zero
            return acc + (peak > 0 ? (avg / peak) : 0);
        }, 0) / capacitySummary.length * 100
        : 0;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="header-section">
                <div className="header-title">
                    <h1>Network Optimization Console</h1>
                    <p>Intelligent Fronthaul Analytics</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
                        SYSTEM ONLINE
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <span className="kpi-label">Active Links</span>
                    <div className="kpi-value">{totalLinks}</div>
                    <div className="kpi-trend trend-up">↑ Monitor Active</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">Monitored Cells</span>
                    <div className="kpi-value">{totalCells}</div>
                    <div className="kpi-trend">All cells operational</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">Avg Link Utilization</span>
                    <div className="kpi-value">{avgUtilization.toFixed(1)}%</div>
                    <div className="kpi-trend trend-up">Peak Load Analysis</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">Optimization Status</span>
                    <div className="kpi-value" style={{ color: '#06b6d4' }}>Active</div>
                    <div className="kpi-trend">Buffering Logic Enabled</div>
                </div>
            </div>

            {/* Panel 1: Topology Map */}
            <motion.div
                className="dashboard-panel panel-topology"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="panel-header">
                    <div className="panel-title">
                        🌐 Network Topology
                    </div>
                    <div>
                        {/* Placeholder for toolbar */}
                    </div>
                </div>
                {topology ? <NetworkGraph2D topology={topology} /> : <LoadingSkeleton type="chart" />}
            </motion.div>

            {/* Panel 2: Insights & Actions */}
            <div className="dashboard-panel panel-insights">
                <div className="panel-header">
                    <div className="panel-title">
                        🧠 AI Recommendations
                    </div>
                </div>
                {capacitySummary && <InsightsGenerator capacityData={capacitySummary} />}
            </div>

            {/* Panel 3: Correlation Analysis */}
            <motion.div
                className="dashboard-panel panel-correlation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="panel-header">
                    <div className="panel-title">
                        🔗 Correlation Analysis
                    </div>
                    <div className="tab-group">
                        <button
                            className={`tab-btn ${correlationView === 'network' ? 'active' : ''}`}
                            onClick={() => setCorrelationView('network')}
                        >
                            Graph
                        </button>
                        <button
                            className={`tab-btn ${correlationView === 'heatmap' ? 'active' : ''}`}
                            onClick={() => setCorrelationView('heatmap')}
                        >
                            Matrix
                        </button>
                    </div>
                </div>
                {correlation && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        {correlationView === 'network' ? (
                            <CorrelationNetwork cells={correlation.cells} matrix={correlation.matrix} />
                        ) : (
                            <CorrelationHeatmap cells={correlation.cells} matrix={correlation.matrix} />
                        )}
                    </div>
                )}
            </motion.div>

            {/* Panel 4: Traffic Analytics */}
            <motion.div
                className="dashboard-panel panel-traffic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="panel-header">
                    <div className="panel-title">
                        📊 Traffic Load
                    </div>
                    <div className="tab-group">
                        {['Link_A', 'Link_B', 'Link_C'].map(link => (
                            <button
                                key={link}
                                className={`tab-btn ${selectedLink === link ? 'active' : ''}`}
                                onClick={() => setSelectedLink(link)}
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </div>
                {trafficData && <TrafficChart data={trafficData} linkId={selectedLink} />}
            </motion.div>

            {/* Panel 5: Capacity Table */}
            <motion.div
                className="dashboard-panel panel-capacity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <div className="panel-header">
                    <div className="panel-title">
                        📋 Capacity Planning
                    </div>
                </div>
                {capacitySummary && <CapacityTable data={capacitySummary} />}
            </motion.div>
        </div>
    );
}
