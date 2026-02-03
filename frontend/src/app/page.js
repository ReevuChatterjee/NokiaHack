'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import TrafficChart from '../components/TrafficChart';
import InsightsGenerator from '../components/InsightsGenerator';

const API_BASE_URL = 'http://localhost:8000';

export default function Home() {
    const [topology, setTopology] = useState(null);
    const [correlation, setCorrelation] = useState(null);
    const [capacitySummary, setCapacitySummary] = useState(null);
    const [trafficData, setTrafficData] = useState(null);
    const [selectedLink, setSelectedLink] = useState('Link_A');
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

            // Fetch initial traffic data
            await fetchTrafficData('Link_A');

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please ensure the backend server is running on port 8000.');
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

    if (loading) {
        return <div className="container"><div className="loading">Loading hackathon data...</div></div>;
    }

    if (error) {
        return <div className="container"><div className="error">{error}</div></div>;
    }

    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <h1>Nokia Hackathon - Problem Statement 1</h1>
                <p>Intelligent Fronthaul Network Optimization</p>
            </div>

            {/* Section 1: Overview */}
            <section className="section">
                <h2>Overview</h2>
                <p>
                    <strong>Problem:</strong> Modern 5G networks face capacity planning challenges in fronthaul links.
                    Traditional approaches over-provision capacity based on peak traffic, leading to inefficient resource utilization
                    and increased operational costs.
                </p>
                <p>
                    <strong>Our Approach:</strong> This project implements a three-phase intelligent optimization pipeline:
                </p>
                <div className="grid-2">
                    <div className="card">
                        <h3>📊 Phase 1: Topology Inference</h3>
                        <p>
                            Analyze packet-loss correlation patterns across 24 cells to infer the hidden fronthaul network topology.
                            Cells sharing the same link exhibit correlated packet loss during congestion events.
                        </p>
                    </div>
                    <div className="card">
                        <h3>📈 Phase 2: Traffic Aggregation</h3>
                        <p>
                            Aggregate per-cell traffic at the inferred link level to understand actual fronthaul link utilization
                            patterns over time.
                        </p>
                    </div>
                    <div className="card">
                        <h3>⚡ Phase 3: Capacity Optimization</h3>
                        <p>
                            Calculate optimal capacity requirements with and without buffering strategies, demonstrating significant
                            reduction in over-provisioning.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Inferred Topology */}
            <section className="section">
                <h2>Inferred Network Topology</h2>
                <p>
                    Using correlation-based clustering on packet-loss events, we successfully identified the fronthaul topology:
                </p>

                <div className="image-container">
                    <img
                        src={`${API_BASE_URL}/api/images/08_network_topology_graph.png`}
                        alt="Network Topology Graph"
                    />
                </div>

                {topology && (
                    <div className="table-container">
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                            Link-to-Cell Mapping
                        </h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Link ID</th>
                                    <th>Cells</th>
                                    <th>Cell Count</th>
                                    <th>Avg Throughput</th>
                                    <th>Peak Throughput</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(topology.links).map(([linkId, linkData]) => (
                                    <tr key={linkId}>
                                        <td><span className="badge">{linkId}</span></td>
                                        <td>{linkData.cells.join(', ')}</td>
                                        <td>{linkData.cell_count}</td>
                                        <td>{linkData.avg_throughput_mbps.toFixed(2)} Mbps</td>
                                        <td>{linkData.peak_throughput_mbps.toFixed(2)} Mbps</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Section 3: Packet-Loss Correlation */}
            <section className="section">
                <h2>Packet-Loss Correlation Matrix</h2>
                <p>
                    This heatmap visualizes the correlation between packet-loss events across all 24 cells.
                    High correlation (red) indicates cells likely sharing the same fronthaul link, while low correlation (blue)
                    suggests independent links.
                </p>

                {correlation && (
                    <CorrelationHeatmap
                        cells={correlation.cells}
                        matrix={correlation.matrix}
                    />
                )}
            </section>

            {/* Section 4: Link Traffic Analysis */}
            <section className="section">
                <h2>Link Traffic Analysis</h2>
                <p>
                    Interactive time-series visualization of aggregated traffic at the link level.
                    Select a link to explore its traffic patterns over the measurement period.
                </p>

                <div className="link-selector">
                    {['Link_A', 'Link_B', 'Link_C'].map(link => (
                        <button
                            key={link}
                            className={`link-button ${selectedLink === link ? 'active' : ''}`}
                            onClick={() => setSelectedLink(link)}
                        >
                            {link}
                        </button>
                    ))}
                </div>

                {trafficData && (
                    <TrafficChart data={trafficData} linkId={selectedLink} />
                )}
            </section>

            {/* Section 5: Capacity Recommendation */}
            <section className="section">
                <h2>Capacity Recommendations</h2>
                <p>
                    Comparison of required link capacity with and without buffering strategies.
                    Buffering allows statistical multiplexing, significantly reducing over-provisioning requirements.
                </p>

                {capacitySummary && (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Link ID</th>
                                    <th>Avg Traffic (Gbps)</th>
                                    <th>Peak Traffic (Gbps)</th>
                                    <th>P95 Traffic (Gbps)</th>
                                    <th>Capacity (No Buffer)</th>
                                    <th>Capacity (With Buffer)</th>
                                    <th>Savings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {capacitySummary.map((link) => {
                                    const noBuffer = parseFloat(link.capacity_no_buffer_gbps);
                                    const withBuffer = parseFloat(link.capacity_with_buffer_gbps);
                                    const savings = ((noBuffer - withBuffer) / noBuffer * 100).toFixed(1);

                                    return (
                                        <tr key={link.link_id}>
                                            <td><span className="badge">{link.link_id}</span></td>
                                            <td>{parseFloat(link.avg_gbps).toFixed(2)}</td>
                                            <td>{parseFloat(link.peak_gbps).toFixed(2)}</td>
                                            <td>{parseFloat(link.p95_gbps).toFixed(2)}</td>
                                            <td>{noBuffer.toFixed(2)} Gbps</td>
                                            <td className="highlight">{withBuffer.toFixed(2)} Gbps</td>
                                            <td><span className="badge success">{savings}%</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Section 6: Final Insights */}
            <section className="section">
                <h2>Key Insights & Recommendations</h2>
                <p>
                    Auto-generated insights based on the analysis results:
                </p>

                {capacitySummary && <InsightsGenerator capacityData={capacitySummary} />}
            </section>
        </div>
    );
}
