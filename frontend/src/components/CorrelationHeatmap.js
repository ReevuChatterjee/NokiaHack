'use client';

import React, { useState } from 'react';

export default function CorrelationHeatmap({ cells, matrix }) {
    const [zoom, setZoom] = useState(1);
    const [threshold, setThreshold] = useState(-1);
    const [selectedCell, setSelectedCell] = useState(null);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    if (!cells || !matrix || matrix.length === 0) {
        return <div className="loading">Loading correlation data...</div>;
    }

    // Find min and max for color scaling
    const flatValues = matrix.flat().filter(v => !isNaN(v) && v !== 1.0);
    const minVal = Math.min(...flatValues);
    const maxVal = Math.max(...flatValues);

    // Color interpolation function
    const getColor = (value) => {
        if (isNaN(value)) return '#1e293b';
        if (value < threshold) return '#1e293b'; // Hide below threshold

        const normalized = (value - minVal) / (maxVal - minVal);

        if (normalized < 0.5) {
            const ratio = normalized * 2;
            const r = Math.round(59 + (255 - 59) * ratio);
            const g = Math.round(130 + (255 - 130) * ratio);
            const b = Math.round(246 + (255 - 246) * ratio);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const ratio = (normalized - 0.5) * 2;
            const r = Math.round(255);
            const g = Math.round(255 - 255 * ratio);
            const b = Math.round(255 - 255 * ratio);
            return `rgb(${r}, ${g}, ${b})`;
        }
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

    return (
        <div>
            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                        🔍 Zoom: {zoom.toFixed(1)}x
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                        🎯 Threshold: {threshold.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min={minVal}
                        max={maxVal}
                        step="0.01"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); setSelectedCell(null); setThreshold(-1); }}
                        className="link-button"
                        style={{ padding: '0.5rem 1rem', height: 'fit-content' }}
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                💡 Click cells to highlight row/column • Drag to pan • Use sliders to zoom and filter
            </p>

            {/* Heatmap */}
            <div
                style={{
                    overflowX: 'auto',
                    marginTop: '1.5rem',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    userSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    width={cells.length * cellSize + labelSize}
                    height={cells.length * cellSize + labelSize}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
                    }}
                >
                    {/* Column labels */}
                    {cells.map((cell, i) => (
                        <text
                            key={`col-${i}`}
                            x={i * cellSize + labelSize + cellSize / 2}
                            y={labelSize - 5}
                            textAnchor="middle"
                            fill={isHighlighted(i, selectedCell) ? '#3b82f6' : '#94a3b8'}
                            fontSize={11 * zoom}
                            fontWeight={isHighlighted(i, selectedCell) ? 'bold' : '500'}
                            style={{ transition: 'all 0.2s' }}
                        >
                            {cell}
                        </text>
                    ))}

                    {/* Row labels and cells */}
                    {matrix.map((row, i) => (
                        <g key={`row-${i}`}>
                            {/* Row label */}
                            <text
                                x={labelSize - 5}
                                y={i * cellSize + labelSize + cellSize / 2 + 4}
                                textAnchor="end"
                                fill={isHighlighted(selectedCell, i) ? '#3b82f6' : '#94a3b8'}
                                fontSize={11 * zoom}
                                fontWeight={isHighlighted(selectedCell, i) ? 'bold' : '500'}
                                style={{ transition: 'all 0.2s' }}
                            >
                                {cells[i]}
                            </text>

                            {/* Cells */}
                            {row.map((value, j) => {
                                const highlighted = isHighlighted(i, j);
                                return (
                                    <g key={`cell-${i}-${j}`}>
                                        <rect
                                            x={j * cellSize + labelSize}
                                            y={i * cellSize + labelSize}
                                            width={cellSize}
                                            height={cellSize}
                                            fill={getColor(value)}
                                            stroke={highlighted ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)'}
                                            strokeWidth={highlighted ? 3 : 1}
                                            style={{
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            opacity={i === j ? 0.3 : (highlighted ? 1 : 0.8)}
                                            onClick={() => handleCellClick(i)}
                                        />
                                        {zoom > 1.2 && (
                                            <text
                                                x={j * cellSize + labelSize + cellSize / 2}
                                                y={i * cellSize + labelSize + cellSize / 2 + 3}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize={8 * zoom}
                                                pointerEvents="none"
                                            >
                                                {value.toFixed(2)}
                                            </text>
                                        )}
                                        <title>{`Cell ${cells[i]} - Cell ${cells[j]}: ${value.toFixed(3)}`}</title>
                                    </g>
                                );
                            })}
                        </g>
                    ))}

                    {/* Legend */}
                    <g transform={`translate(${labelSize}, ${cells.length * cellSize + labelSize + 20})`}>
                        <text x="0" y="0" fill="#94a3b8" fontSize={12 * zoom} fontWeight="500">
                            Correlation:
                        </text>
                        <text x="0" y="15" fill="#3b82f6" fontSize={11 * zoom}>
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
                        <text x={30 + 10 * 15 + 5} y="15" fill="#ef4444" fontSize={11 * zoom}>
                            High
                        </text>
                    </g>
                </svg>
            </div>

            {selectedCell !== null && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px'
                }}>
                    <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                        Selected: Cell {cells[selectedCell]}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Viewing correlations with all other cells
                    </p>
                </div>
            )}
        </div>
    );
}
