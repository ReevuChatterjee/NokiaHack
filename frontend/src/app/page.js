'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import TrafficChart from '../components/TrafficChart';
import AIChatPanel from '../components/AIChatPanel';
import CapacityTable from '../components/CapacityTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DashboardLoader from '../components/DashboardLoader';
import { useDashboard } from '../context/DashboardContext';
import config from '../config';
import NativeInit from '../components/NativeInit';
import MobileNav from '../components/MobileNav';

// Dynamically import network graphs
const NetworkGraph2D = dynamic(() => import('../components/NetworkGraph3D'), {
    ssr: false,
    loading: () => <LoadingSkeleton type="chart" />
});

const CorrelationNetwork = dynamic(() => import('../components/CorrelationNetwork'), {
    ssr: false,
    loading: () => <LoadingSkeleton type="chart" />
});

const API_BASE_URL = config.apiBaseUrl;

export default function Home() {
    // Global State from Context
    const {
        topology,
        correlation,
        capacitySummary,
        trafficData,
        allLinksTraffic,
        selectedLink,
        setSelectedLink,
        loading,
        error,
        fetchDashboardData
    } = useDashboard();

    // Local UI State
    const [correlationView, setCorrelationView] = useState('network');
    const [uploading, setUploading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // Mobile Tab State
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768 || config.isNative);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);





    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Upload successful! Dashboard updating...');
            await fetchDashboardData(true); // Force refresh
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setUploading(false);
        }
    };



    const handleReset = async () => {
        if (!confirm('Are you sure you want to revert to the original dataset? This will discard any uploaded data.')) return;

        setResetting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/reset`);
            alert('System reset to original state.');
            await fetchDashboardData(true);
        } catch (err) {
            console.error('Reset failed:', err);
            alert('Reset failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setResetting(false);
        }
    };

    if (loading) return <DashboardLoader />;
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
            style={{ paddingBottom: isMobile ? '100px' : '1.5rem' }} // Add space for bottom nav
        >
            <NativeInit />
            {/* Header - Show on Desktop OR Dashboard Tab */}
            {(!isMobile || activeTab === 'dashboard') && (
                <motion.header className="header-section" variants={itemVariants}>
                    <div className="header-title">
                        <h1>NOKIA <span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>NOC</span></h1>
                        <p>Intelligent Fronthaul Optimization</p>
                    </div>
                    {/* Hide robust controls on mobile unless specific tab? Or simplify */}
                    <div style={{ gap: '1rem', alignItems: 'center', flexWrap: 'wrap', display: isMobile ? 'none' : 'flex' }}>
                        <label className="glass-btn" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                            {uploading ? 'Uploading...' : 'Upload Data'}
                            <input
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                        <div className="glass-btn" onClick={handleReset} style={{ cursor: resetting ? 'wait' : 'pointer' }}>
                            {resetting ? 'Resetting...' : 'Reset Data'}
                        </div>
                        <div className="glass-btn" onClick={() => window.location.reload()}>
                            Refresh
                        </div>
                        <Link href="/dataset" className="glass-btn" style={{ textDecoration: 'none' }}>
                            View Dataset
                        </Link>
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
                    {/* Mobile Only Simplified Header Controls */}
                    {isMobile && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div className="badge" style={{ background: 'rgba(0, 242, 234, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(0, 242, 234, 0.3)' }}>LIVE</div>
                            <div className="glass-btn" onClick={() => window.location.reload()} style={{ padding: '0.25rem 0.5rem' }}>↻</div>
                        </div>
                    )}
                </motion.header>
            )}

            {/* System Summary - Desktop Only or Dashboard Tab */}
            {(!isMobile || activeTab === 'dashboard') && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        gridColumn: 'span 12',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderLeft: '3px solid rgba(59, 130, 246, 0.6)',
                        borderRadius: '6px',
                        marginBottom: '1.5rem',
                        display: isMobile ? 'none' : 'block' // Hide text on mobile to save space
                    }}
                >
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        <strong>System Overview:</strong> Automatically infers fronthaul topology from packet-loss correlation and computes buffer-aware Ethernet capacity.
                    </p>
                </motion.div>
            )}

            {/* KPI Cards - Dashboard Tab */}
            {(!isMobile || activeTab === 'dashboard') && (
                <motion.div className="kpi-grid" variants={itemVariants}>
                    <div className="kpi-card">
                        <span className="kpi-label">Active Links</span>
                        <div className="kpi-value">{totalLinks}</div>
                        <div style={{ color: 'var(--accent-success)', fontSize: '0.9rem' }}>▲ Optimal</div>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Cells</span>
                        <div className="kpi-value">{totalCells}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• 100% Coverage</div>
                    </div>
                    <div className="kpi-card">
                        <span className="kpi-label">Network Load</span>
                        <div className="kpi-value" style={{ color: avgUtilization > 80 ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                            {avgUtilization.toFixed(1)}%
                        </div>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>~ Stable</div>
                    </div>
                    {/* Hide AI Status on mobile to save space, redundant with tab */}
                    {!isMobile && (
                        <div className="kpi-card">
                            <span className="kpi-label">AI Status</span>
                            <div className="kpi-value text-gradient">ACTIVE</div>
                            <div style={{ color: 'var(--accent-tertiary)', fontSize: '0.9rem' }}>✦ Predictive On</div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Panel 1: Topology Map - Dashboard Tab */}
            {(!isMobile || activeTab === 'dashboard') && (
                <motion.div className="dashboard-panel panel-topology" variants={itemVariants}>
                    <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className="panel-title">Live Topology</div>
                    </div>
                    {topology ? <NetworkGraph2D topology={topology} /> : <LoadingSkeleton type="chart" />}
                </motion.div>
            )}

            {/* Panel 2: Insights & Actions (Chat) - Assistant Tab on Mobile, Panel on Desktop */}
            {(!isMobile || activeTab === 'assistant') && (
                <motion.div
                    className="dashboard-panel panel-insights"
                    variants={itemVariants}
                    style={isMobile ? { gridColumn: 'span 12', height: 'calc(100vh - 180px)', minHeight: '500px' } : {}}
                >
                    <div className="panel-header">
                        <div className="panel-title">NOC AI Assistant</div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <AIChatPanel />
                    </div>
                </motion.div>
            )}

            {/* Panel 4: Traffic Analytics - Monitor Tab */}
            {(!isMobile || activeTab === 'analytics') && (
                <motion.div className="dashboard-panel panel-traffic" variants={itemVariants}>
                    <div className="panel-header">
                        <div className="panel-title">Traffic Load</div>
                        <div className="tab-group" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                            {topology && Object.keys(topology.links).map(link => (
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
                    {trafficData && <TrafficChart data={trafficData} linkId={selectedLink} allLinksData={allLinksTraffic} />}
                </motion.div>
            )}

            {/* Panel 3: Correlation Analysis - Monitor Tab */}
            {(!isMobile || activeTab === 'analytics') && (
                <motion.div className="dashboard-panel panel-correlation" variants={itemVariants}>
                    <div className="panel-header">
                        <div className="panel-title">Correlation Matrix</div>
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
            )}

            {/* Panel 5: Capacity Table - Monitor Tab */}
            {(!isMobile || activeTab === 'analytics') && (
                <motion.div className="dashboard-panel panel-capacity" variants={itemVariants}>
                    <div className="panel-header">
                        <div className="panel-title">Capacity Planning</div>
                    </div>
                    {capacitySummary && <CapacityTable data={capacitySummary} />}
                </motion.div>
            )}

            {/* Mobile Navigation Bar */}
            {isMobile && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />}
        </motion.div>
    );
}
