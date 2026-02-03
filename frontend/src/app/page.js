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

    // Variant for container stagger
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    // Variant for item pop-in
    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <motion.div
            className="dashboard-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.header className="header-section" variants={itemVariants}>
                <div className="header-title">
                    <h1>NOKIA <span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>NOC</span></h1>
                    <p>Intelligent Fronthaul Optimization</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="glass-btn" onClick={() => window.location.reload()}>
                        🔄 Refresh System
                    </div>
                    <div className="badge" style={{
                        background: 'rgba(0, 242, 234, 0.1)',
                        color: 'var(--accent-primary)',
                        border: '1px solid rgba(0, 242, 234, 0.3)',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span className="pulsing-dot" style={{
                            width: 8, height: 8, background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)'
                        }}></span>
                        LIVE MONITORING
                    </div>
                </div>
            </motion.header>

            {/* KPI Cards */}
            <motion.div className="kpi-grid" variants={itemVariants}>
                <div className="kpi-card">
                    <span className="kpi-label">Active Links</span>
                    <div className="kpi-value">{totalLinks}</div>
                    <div style={{ color: 'var(--accent-success)', fontSize: '0.9rem' }}>▲ Optimal Performance</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">Monitored Cells</span>
                    <div className="kpi-value">{totalCells}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• 100% Signal Coverage</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">Network Load</span>
                    <div className="kpi-value" style={{ color: avgUtilization > 80 ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                        {avgUtilization.toFixed(1)}%
                    </div>
                    <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>~ Stable Throughput</div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">AI Status</span>
                    <div className="kpi-value text-gradient">ACTIVE</div>
                    <div style={{ color: 'var(--accent-tertiary)', fontSize: '0.9rem' }}>✦ Predictive Logic On</div>
                </div>
            </motion.div>

            {/* Panel 1: Topology Map */}
            <motion.div className="dashboard-panel panel-topology" variants={itemVariants}>
                <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <div className="panel-title">
                        🌐 Live Topology
                    </div>
                </div>
                {topology ? <NetworkGraph2D topology={topology} /> : <LoadingSkeleton type="chart" />}
            </motion.div>

            {/* Panel 2: Insights & Actions */}
            <motion.div className="dashboard-panel panel-insights" variants={itemVariants}>
                <div className="panel-header">
                    <div className="panel-title">
                        🧠 AI Recommendations
                    </div>
                </div>
                {capacitySummary && <InsightsGenerator capacityData={capacitySummary} />}
            </motion.div>

            {/* Panel 3: Correlation Analysis */}
            <motion.div className="dashboard-panel panel-correlation" variants={itemVariants}>
                <div className="panel-header">
                    <div className="panel-title">
                        🔗 Correlation Matrix
                    </div>
                    <div className="tab-group">
                        <button
                            className={`tab-btn ${correlationView === 'network' ? 'active' : ''}`}
                            onClick={() => setCorrelationView('network')}
                            style={{ color: correlationView === 'network' ? '#000' : 'var(--text-secondary)' }}
                        >
                            Graph
                        </button>
                        <button
                            className={`tab-btn ${correlationView === 'heatmap' ? 'active' : ''}`}
                            onClick={() => setCorrelationView('heatmap')}
                            style={{ color: correlationView === 'heatmap' ? '#000' : 'var(--text-secondary)' }}
                        >
                            Heatmap
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
            <motion.div className="dashboard-panel panel-traffic" variants={itemVariants}>
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
            <motion.div className="dashboard-panel panel-capacity" variants={itemVariants}>
                <div className="panel-header">
                    <div className="panel-title">
                        📋 Capacity Planning
                    </div>
                </div>
                {capacitySummary && <CapacityTable data={capacitySummary} />}
            </motion.div>
        </motion.div>
    );
}
