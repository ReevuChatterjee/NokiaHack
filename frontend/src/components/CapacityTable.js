'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function CapacityTable({ data }) {
    const [sortColumn, setSortColumn] = useState('peak_gbps');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterText, setFilterText] = useState('');

    if (!data || data.length === 0) {
        return <div className="loading">Loading capacity data...</div>;
    }

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const sortedData = useMemo(() => {
        let filtered = data;
        if (filterText) {
            filtered = data.filter(item =>
                item.link_id.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        return [...filtered].sort((a, b) => {
            const aVal = parseFloat(a[sortColumn]);
            const bVal = parseFloat(b[sortColumn]);
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [data, sortColumn, sortDirection, filterText]);

    const getSortIcon = (column) => {
        if (sortColumn !== column) return '⇅';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getSparklineData = (link) => {
        const noBuffer = parseFloat(link.capacity_no_buffer_gbps);
        const withBuffer = parseFloat(link.capacity_with_buffer_gbps);
        const peak = parseFloat(link.peak_gbps);
        const avg = parseFloat(link.avg_gbps);

        return [avg, (avg + peak) / 2, peak, withBuffer, noBuffer];
    };

    const renderSparkline = (data, color) => {
        const width = 60;
        const height = 20;
        const max = Math.max(...data);
        const points = data.map((val, i) =>
            `${(i / (data.length - 1)) * width},${height - (val / max) * height}`
        ).join(' ');

        return (
            <svg width={width} height={height} style={{ display: 'inline-block' }}>
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                />
            </svg>
        );
    };

    const exportToCSV = () => {
        const headers = ['Link ID', 'Avg (Gbps)', 'Peak (Gbps)', 'P95 (Gbps)', 'No Buffer (Gbps)', 'With Buffer (Gbps)', 'Savings (%)'];
        const rows = sortedData.map(link => {
            const noBuffer = parseFloat(link.capacity_no_buffer_gbps);
            const withBuffer = parseFloat(link.capacity_with_buffer_gbps);
            const savings = ((noBuffer - withBuffer) / noBuffer * 100).toFixed(1);

            return [
                link.link_id,
                link.avg_gbps,
                link.peak_gbps,
                link.p95_gbps,
                noBuffer,
                withBuffer,
                savings
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'capacity_summary.csv';
        a.click();
    };

    return (
        <div>
            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Filter by link ID..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '0.75rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#f1f5f9',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.95rem'
                    }}
                />
                <button
                    onClick={exportToCSV}
                    className="link-button active"
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('link_id')} style={{ cursor: 'pointer' }}>
                                Link ID {getSortIcon('link_id')}
                            </th>
                            <th onClick={() => handleSort('avg_gbps')} style={{ cursor: 'pointer' }}>
                                Avg (Gbps) {getSortIcon('avg_gbps')}
                            </th>
                            <th onClick={() => handleSort('peak_gbps')} style={{ cursor: 'pointer' }}>
                                Peak (Gbps) {getSortIcon('peak_gbps')}
                            </th>
                            <th onClick={() => handleSort('p95_gbps')} style={{ cursor: 'pointer' }}>
                                P95 (Gbps) {getSortIcon('p95_gbps')}
                            </th>
                            <th onClick={() => handleSort('capacity_no_buffer_gbps')} style={{ cursor: 'pointer' }}>
                                No Buffer {getSortIcon('capacity_no_buffer_gbps')}
                            </th>
                            <th onClick={() => handleSort('capacity_with_buffer_gbps')} style={{ cursor: 'pointer' }}>
                                With Buffer {getSortIcon('capacity_with_buffer_gbps')}
                            </th>
                            <th>Savings</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((link, index) => {
                            const noBuffer = parseFloat(link.capacity_no_buffer_gbps);
                            const withBuffer = parseFloat(link.capacity_with_buffer_gbps);
                            const savings = ((noBuffer - withBuffer) / noBuffer * 100).toFixed(1);
                            const sparklineData = getSparklineData(link);

                            return (
                                <motion.tr
                                    key={link.link_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <td>
                                        <span className="badge">{link.link_id}</span>
                                    </td>
                                    <td>{parseFloat(link.avg_gbps).toFixed(2)}</td>
                                    <td>{parseFloat(link.peak_gbps).toFixed(2)}</td>
                                    <td>{parseFloat(link.p95_gbps).toFixed(2)}</td>
                                    <td>{noBuffer.toFixed(2)}</td>
                                    <td>
                                        <span className="highlight">{withBuffer.toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="badge success">{savings}%</span>
                                            <div style={{
                                                flex: 1,
                                                height: '6px',
                                                background: 'rgba(148, 163, 184, 0.2)',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${savings}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                                                    borderRadius: '3px'
                                                }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {renderSparkline(sparklineData, '#8b5cf6')}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {sortedData.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8'
                }}>
                    No links match your filter
                </div>
            )}
        </div>
    );
}
