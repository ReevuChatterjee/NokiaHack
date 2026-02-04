'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:8000';

export default function DatasetPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [sortColumn, setSortColumn] = useState('time_seconds');
    const [sortDirection, setSortDirection] = useState('asc');

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/link-traffic`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dataset:', err);
                setError('Failed to load dataset. Please ensure the backend is running.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle sorting
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return '⇅';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    // Process data for display
    const processedData = useMemo(() => {
        let filtered = data;

        // Filter
        if (filterText) {
            const lowerFilter = filterText.toLowerCase();
            filtered = data.filter(item =>
                item.link_id.toLowerCase().includes(lowerFilter) ||
                item.time_seconds.toString().includes(lowerFilter) ||
                item.aggregated_gbps.toString().includes(lowerFilter)
            );
        }

        // Sort
        return [...filtered].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle numeric values
            if (sortColumn === 'time_seconds' || sortColumn === 'aggregated_gbps') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, filterText, sortColumn, sortDirection]);

    // Limit displayed rows for performance if dataset is huge
    const displayedData = processedData.slice(0, 1000);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <motion.header
                className="header-section"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-title">
                    <h1>NOKIA <span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>NOC</span></h1>
                    <p>Raw Traffic Dataset</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/" className="glass-btn">
                        ← Back to Dashboard
                    </Link>
                </div>
            </motion.header>

            {/* Main Content */}
            <motion.div
                className="dashboard-panel"
                style={{ gridColumn: 'span 12', minHeight: '80vh' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="panel-header">
                    <div className="panel-title">
                        Dataset Viewer ({processedData.length.toLocaleString()} rows)
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Filter data..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#f1f5f9',
                            maxWidth: '400px'
                        }}
                    />
                    {displayedData.length < processedData.length && (
                        <div style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Showing first 1,000 rows
                        </div>
                    )}
                </div>

                {/* Data Table */}
                {loading ? (
                    <div className="loading">Loading dataset...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <table>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th onClick={() => handleSort('time_seconds')} style={{ cursor: 'pointer' }}>
                                        Time (s) {getSortIcon('time_seconds')}
                                    </th>
                                    <th onClick={() => handleSort('link_id')} style={{ cursor: 'pointer' }}>
                                        Link ID {getSortIcon('link_id')}
                                    </th>
                                    <th onClick={() => handleSort('aggregated_gbps')} style={{ cursor: 'pointer' }}>
                                        Traffic (Gbps) {getSortIcon('aggregated_gbps')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedData.map((row, index) => (
                                    <tr key={`${row.link_id}-${row.time_seconds}-${index}`}>
                                        <td>{parseFloat(row.time_seconds).toFixed(2)}</td>
                                        <td>
                                            <span className="badge">{row.link_id}</span>
                                        </td>
                                        <td>
                                            <span style={{
                                                color: parseFloat(row.aggregated_gbps) > 10000 ? '#ef4444' : '#f1f5f9',
                                                fontWeight: parseFloat(row.aggregated_gbps) > 10000 ? 'bold' : 'normal'
                                            }}>
                                                {parseFloat(row.aggregated_gbps).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
