'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { scaleLinear } from 'd3-scale';
import { max, min, mean } from 'd3-array';

export default function TrafficChart({ data, linkId, allLinksData }) {
    const [compareMode, setCompareMode] = useState(false);
    const [selectedLinks, setSelectedLinks] = useState([linkId]);
    const [timeRange, setTimeRange] = useState([0, 100]);
    const [aggregation, setAggregation] = useState('raw');
    const [showStats, setShowStats] = useState(true);

    if (!data || data.length === 0) {
        return <div className="loading">No traffic data available</div>;
    }

    // Process data based on aggregation level
    const processedData = useMemo(() => {
        if (aggregation === 'raw') {
            return data.map(item => ({
                time: parseFloat(item.time_seconds).toFixed(2),
                gbps: parseFloat(item.aggregated_gbps),
                link: item.link_id
            }));
        }

        // Aggregate data
        const binSize = aggregation === '1s' ? 1 : aggregation === '5s' ? 5 : 10;
        const bins = {};

        data.forEach(item => {
            const bin = Math.floor(parseFloat(item.time_seconds) / binSize) * binSize;
            if (!bins[bin]) bins[bin] = [];
            bins[bin].push(parseFloat(item.aggregated_gbps));
        });

        return Object.entries(bins).map(([time, values]) => ({
            time: parseFloat(time).toFixed(2),
            gbps: mean(values),
            link: data[0].link_id
        }));
    }, [data, aggregation]);

    // Sample data for performance
    const maxPoints = 500;
    const sampledData = processedData.length > maxPoints
        ? processedData.filter((_, index) => index % Math.ceil(processedData.length / maxPoints) === 0)
        : processedData;

    // Filter by time range
    const minTime = min(sampledData, d => parseFloat(d.time));
    const maxTime = max(sampledData, d => parseFloat(d.time));
    const rangeMin = minTime + (maxTime - minTime) * (timeRange[0] / 100);
    const rangeMax = minTime + (maxTime - minTime) * (timeRange[1] / 100);

    const filteredData = sampledData.filter(d => {
        const time = parseFloat(d.time);
        return time >= rangeMin && time <= rangeMax;
    });

    // Calculate statistics
    const stats = useMemo(() => {
        const values = filteredData.map(d => d.gbps);
        return {
            min: min(values),
            max: max(values),
            avg: mean(values),
            count: values.length
        };
    }, [filteredData]);

    const linkColors = {
        'Link_A': '#3b82f6',
        'Link_B': '#8b5cf6',
        'Link_C': '#10b981'
    };

    const toggleLink = (link) => {
        setSelectedLinks(prev =>
            prev.includes(link)
                ? prev.filter(l => l !== link)
                : [...prev, link]
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%' }}>
            {/* Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
                {/* Comparison Mode */}{/* ... (rest of controls) */}
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={compareMode}
                            onChange={(e) => setCompareMode(e.target.checked)}
                        />
                        📊 Compare
                    </label>
                    {compareMode && allLinksData && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {['Link_A', 'Link_B', 'Link_C'].map(link => (
                                <button
                                    key={link}
                                    onClick={() => toggleLink(link)}
                                    className="link-button"
                                    style={{
                                        padding: '0.2rem 0.5rem',
                                        fontSize: '0.75rem',
                                        background: selectedLinks.includes(link) ? linkColors[link] : 'rgba(15, 23, 42, 0.6)',
                                        borderColor: selectedLinks.includes(link) ? linkColors[link] : 'rgba(148, 163, 184, 0.2)'
                                    }}
                                >
                                    {link}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Aggregation */}
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                        ⏱️ Bin
                    </label>
                    <select
                        value={aggregation}
                        onChange={(e) => setAggregation(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.3rem',
                            fontSize: '0.85rem',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: '#f1f5f9',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px'
                        }}
                    >
                        <option value="raw">Raw</option>
                        <option value="1s">1s</option>
                        <option value="5s">5s</option>
                        <option value="10s">10s</option>
                    </select>
                </div>

                {/* Statistics Toggle */}
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <input
                            type="checkbox"
                            checked={showStats}
                            onChange={(e) => setShowStats(e.target.checked)}
                        />
                        📈 Stats
                    </label>
                </div>
            </div>

            {/* Time Range Slider */}
            <div style={{
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                marginBottom: '0.5rem'
            }}>
                <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                    🎯 Range: {timeRange[0]}% - {timeRange[1]}%
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="range"
                        min="0"
                        max={timeRange[1] - 1}
                        value={timeRange[0]}
                        onChange={(e) => setTimeRange([parseInt(e.target.value), timeRange[1]])}
                        style={{ flex: 1, height: '4px' }}
                    />
                    <input
                        type="range"
                        min={timeRange[0] + 1}
                        max="100"
                        value={timeRange[1]}
                        onChange={(e) => setTimeRange([timeRange[0], parseInt(e.target.value)])}
                        style={{ flex: 1, height: '4px' }}
                    />
                </div>
            </div>

            {/* Statistics Panel */}
            {showStats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <div className="card" style={{ padding: '0.5rem' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Min</div>
                        <div style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: 'bold' }}>
                            {stats.min?.toFixed(2) || '0'}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '0.5rem' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Avg</div>
                        <div style={{ color: '#8b5cf6', fontSize: '1rem', fontWeight: 'bold' }}>
                            {stats.avg?.toFixed(2) || '0'}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '0.5rem' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Max</div>
                        <div style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold' }}>
                            {stats.max?.toFixed(2) || '0'}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '0.5rem' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Count</div>
                        <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>
                            {stats.count?.toLocaleString() || '0'}
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div style={{ width: '100%', flex: 1, minHeight: 200, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={filteredData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
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
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                            formatter={(value) => [`${parseFloat(value).toFixed(2)} Gbps`, 'Traffic']}
                            labelFormatter={(label) => `Time: ${label}s`}
                        />
                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        <Line
                            type="monotone"
                            dataKey="gbps"
                            stroke={linkColors[linkId] || '#3b82f6'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#8b5cf6' }}
                            name={linkId}
                        />
                        <Brush
                            dataKey="time"
                            height={30}
                            stroke="#8b5cf6"
                            fill="rgba(139, 92, 246, 0.1)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
