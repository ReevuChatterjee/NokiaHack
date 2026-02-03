'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrafficChart({ data, linkId }) {
    if (!data || data.length === 0) {
        return <div className="loading">No traffic data available</div>;
    }

    // Format data for Recharts
    const chartData = data.map(item => ({
        time: parseFloat(item.time_seconds).toFixed(2),
        gbps: parseFloat(item.aggregated_gbps)
    }));

    // Sample data if too large (take every nth point for performance)
    const maxPoints = 500;
    const sampledData = chartData.length > maxPoints
        ? chartData.filter((_, index) => index % Math.ceil(chartData.length / maxPoints) === 0)
        : chartData;

    return (
        <div style={{ width: '100%', height: 400, marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={sampledData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        label={{ value: 'Traffic (Gbps)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#f1f5f9'
                        }}
                        formatter={(value) => [`${parseFloat(value).toFixed(2)} Gbps`, 'Traffic']}
                        labelFormatter={(label) => `Time: ${label}s`}
                    />
                    <Legend
                        wrapperStyle={{ color: '#94a3b8' }}
                        formatter={() => `${linkId} Traffic`}
                    />
                    <Line
                        type="monotone"
                        dataKey="gbps"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
