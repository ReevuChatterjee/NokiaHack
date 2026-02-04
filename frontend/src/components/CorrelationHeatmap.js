'use client';

import React, { useState, useEffect } from 'react';

export default function CorrelationHeatmap({ cells, matrix }) {
    // Early return MUST come before any hooks to avoid React hooks violation
    if (!cells || !matrix || matrix.length === 0) {
        return <div className="loading">Loading correlation data...</div>;
    }

    const [zoom, setZoom] = useState(1);
    const [threshold, setThreshold] = useState(-1);
    const [selectedCell, setSelectedCell] = useState(null);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Mobile Detection
    const [isMobileLayout, setIsMobileLayout] = useState(false);
    useEffect(() => {
        const check = () => setIsMobileLayout(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Find min and max for color scaling
    const flatValues = matrix.flat().filter(v => !isNaN(v) && v !== 1.0);
    const minVal = Math.min(...flatValues);
    const maxVal = Math.max(...flatValues);

    // Color interpolation function (Theme: Dark -> Violet -> Cyan)
    const getColor = (value) => {
        if (isNaN(value)) return '#0f172a';
        if (value < threshold) return '#0f172a';

        const normalized = (value - minVal) / (maxVal - minVal);

        let r, g, b;
        if (normalized < 0.5) {
            // Dark to Violet (8b5cf6 = 139, 92, 246)
            const ratio = normalized * 2;
            r = Math.round(15 + (139 - 15) * ratio);
            g = Math.round(23 + (92 - 23) * ratio);
            b = Math.round(42 + (246 - 42) * ratio);
        } else {
            // Violet to Cyan (06b6d4 = 6, 182, 212)
            const ratio = (normalized - 0.5) * 2;
            r = Math.round(139 + (6 - 139) * ratio);
            g = Math.round(92 + (182 - 92) * ratio);
            b = Math.round(246 + (212 - 246) * ratio);
        }
        return `rgb(${r}, ${g}, ${b})`;
    };

    const cellSize = 40 * zoom;
    const labelSize = 35 * zoom;

    const handleMouseDown = (e) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            setPanOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleCellClick = (cellIndex) => {
        setSelectedCell(selectedCell === cellIndex ? null : cellIndex);
    };

    const isHighlighted = (i, j) => {
        if (selectedCell === null) return false;
        return i === selectedCell || j === selectedCell;
    };

    const [hoveredCell, setHoveredCell] = useState(null);

    // Calculate top correlations for selected/hovered cell
    const activeIndex = selectedCell !== null ? selectedCell : (hoveredCell ? hoveredCell.row : null);
    const activeCellName = activeIndex !== null ? cells[activeIndex] : null;

    const cellInsights = activeIndex !== null ? matrix[activeIndex]
        .map((val, idx) => ({ cell: cells[idx], value: val, idx }))
        .filter(item => item.idx !== activeIndex) // Exclude self
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) : []; // Top 5

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', height: '100%', alignItems: 'flex-start', overflowY: 'auto' }}>

            {/* Main Heatmap Area */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Controls (Compact) */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '8px',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>🔎 Zoom:</div>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ width: '100px' }}
                    />
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                    <button
                        onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); setSelectedCell(null); }}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                        Reset View
                    </button>
                    {!isMobileLayout && (
                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                            Scroll to pan • Click for details
                        </div>
                    )}
                </div>

                {/* SVG Container */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        cursor: isPanning ? 'grabbing' : 'grab',
                        background: 'rgba(0,0,0,0.2)', // Darker backing
                        borderRadius: '8px',
                        position: 'relative'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => { handleMouseUp(); setHoveredCell(null); }}
                >
                    <svg
                        width={cells.length * cellSize + labelSize}
                        height={cells.length * cellSize + labelSize}
                        style={{
                            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                            transition: isPanning ? 'none' : 'transform 0.2s'
                        }}
                    >
                        {/* Hover Crosshairs */}
                        {hoveredCell && (
                            <g pointerEvents="none">
                                {/* Row Highlight */}
                                <rect
                                    x={0}
                                    y={hoveredCell.row * cellSize + labelSize}
                                    width={cells.length * cellSize + labelSize}
                                    height={cellSize}
                                    fill="rgba(59, 130, 246, 0.1)"
                                />
                                {/* Column Highlight */}
                                <rect
                                    x={hoveredCell.col * cellSize + labelSize}
                                    y={0}
                                    width={cellSize}
                                    height={cells.length * cellSize + labelSize}
                                    fill="rgba(59, 130, 246, 0.1)"
                                />
                            </g>
                        )}

                        {/* Cells */}
                        {matrix.map((row, i) => (
                            <g key={`row-${i}`}>
                                <text
                                    x={labelSize - 8}
                                    y={i * cellSize + labelSize + cellSize / 2 + 4}
                                    textAnchor="end"
                                    fill={activeIndex === i ? '#3b82f6' : '#64748b'}
                                    fontSize={10 * zoom}
                                    fontWeight={activeIndex === i ? 'bold' : 'normal'}
                                >
                                    {cells[i]}
                                </text>
                                {row.map((value, j) => (
                                    <rect
                                        key={`cell-${i}-${j}`}
                                        x={j * cellSize + labelSize}
                                        y={i * cellSize + labelSize}
                                        width={cellSize - 1}
                                        height={cellSize - 1}
                                        fill={getColor(value)}
                                        rx={2 * zoom}
                                        onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                                        onClick={(e) => { e.stopPropagation(); handleCellClick(i); }}
                                        style={{ transition: 'fill 0.2s', cursor: 'pointer' }}
                                        stroke={hoveredCell?.row === i && hoveredCell?.col === j ? '#fff' : 'none'}
                                        strokeWidth={2}
                                    />
                                ))}
                            </g>
                        ))}

                        {/* Column Labels */}
                        {cells.map((cell, i) => (
                            <text
                                key={`col-${i}`}
                                x={i * cellSize + labelSize + cellSize / 2}
                                y={labelSize - 10}
                                textAnchor="middle"
                                fill={activeIndex === i ? '#3b82f6' : '#64748b'}
                                fontSize={10 * zoom}
                                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                                {cell}
                            </text>
                        ))}

                        {/* Legend */}
                        <g transform={`translate(${labelSize}, ${cells.length * cellSize + labelSize + 20})`}>
                            <text x="0" y="0" fill="#94a3b8" fontSize={12 * zoom} fontWeight="500">
                                Correlation:
                            </text>
                            <text x="0" y="15" fill="#8b5cf6" fontSize={11 * zoom}>
                                Low
                            </text>
                            {[...Array(10)].map((_, i) => (
                                <rect
                                    key={i}
                                    x={30 + i * 15}
                                    y={5}
                                    width={15}
                                    height={15}
                                    fill={getColor(minVal + (maxVal - minVal) * (i / 9))}
                                    stroke="rgba(148, 163, 184, 0.2)"
                                />
                            ))}
                            <text x={30 + 10 * 15 + 5} y="15" fill="#06b6d4" fontSize={11 * zoom}>
                                High
                            </text>
                        </g>
                    </svg>
                </div>
            </div>

            {/* Insights Side Panel / Bottom Sheet */}
            {(selectedCell !== null || !isMobileLayout) && (
                <div style={isMobileLayout ? {
                    position: 'fixed',
                    bottom: '80px', // Above nav bar
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.98)',
                    borderTop: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '1rem',
                    zIndex: 200,
                    maxHeight: '50vh',
                    overflowY: 'auto',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.3s ease-out'
                } : {
                    flex: '1 1 280px',
                    minWidth: '280px',
                    maxWidth: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    overflowY: 'auto',
                    maxHeight: '600px'
                }}>
                    {isMobileLayout && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                            <button
                                onClick={() => setSelectedCell(null)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', padding: '0 0.5rem' }}
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>
                            Correlation Details
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                            {activeCellName ? `Analysis for ${activeCellName}` : 'Hover over a cell'}
                        </p>
                    </div>

                    {activeCellName ? (
                        <div className="fade-in">
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Top Correlations:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {cellInsights.map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{item.cell}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '6px',
                                                background: '#334155',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${Math.abs(item.value) * 100}%`,
                                                    height: '100%',
                                                    background: item.value > 0.7 ? '#06b6d4' : item.value > 0.4 ? '#8b5cf6' : '#64748b'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', width: '35px', textAlign: 'right' }}>
                                                {item.value.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <strong>Insight</strong>
                                </div>
                                <p style={{ fontSize: '0.8rem', margin: 0, color: '#bfdbfe', lineHeight: '1.4' }}>
                                    {cellInsights[0]?.value > 0.8
                                        ? <>{activeCellName} is <strong>highly synchronized</strong> with {cellInsights[0].cell}. Consider optimizing them as a cluster.</>
                                        : <>{activeCellName} shows independent traffic patterns. No strong dependencies detected.</>
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👆</div>
                            <p style={{ fontSize: '0.9rem' }}>Hover or click a cell to view detailed correlation analysis.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
