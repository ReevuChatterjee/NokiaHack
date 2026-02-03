import React from 'react';

export default function CorrelationHeatmap({ cells, matrix }) {
    if (!cells || !matrix || matrix.length === 0) {
        return <div className="loading">Loading correlation data...</div>;
    }

    // Find min and max for color scaling
    const flatValues = matrix.flat().filter(v => !isNaN(v) && v !== 1.0); // Exclude diagonal
    const minVal = Math.min(...flatValues);
    const maxVal = Math.max(...flatValues);

    // Color interpolation function
    const getColor = (value) => {
        if (isNaN(value)) return '#1e293b';

        // Normalize value to 0-1 range
        const normalized = (value - minVal) / (maxVal - minVal);

        // Color scale: blue (low) -> white (mid) -> red (high)
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

    const cellSize = 40;
    const labelSize = 35;

    return (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <svg
                width={cells.length * cellSize + labelSize}
                height={cells.length * cellSize + labelSize}
                style={{ maxWidth: '100%', height: 'auto' }}
            >
                {/* Column labels */}
                {cells.map((cell, i) => (
                    <text
                        key={`col-${i}`}
                        x={i * cellSize + labelSize + cellSize / 2}
                        y={labelSize - 5}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontWeight="500"
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
                            fill="#94a3b8"
                            fontSize="11"
                            fontWeight="500"
                        >
                            {cells[i]}
                        </text>

                        {/* Cells */}
                        {row.map((value, j) => (
                            <g key={`cell-${i}-${j}`}>
                                <rect
                                    x={j * cellSize + labelSize}
                                    y={i * cellSize + labelSize}
                                    width={cellSize}
                                    height={cellSize}
                                    fill={getColor(value)}
                                    stroke="rgba(148, 163, 184, 0.2)"
                                    strokeWidth="1"
                                    style={{ transition: 'opacity 0.2s' }}
                                    opacity={i === j ? 0.3 : 1}
                                />
                                {/* Show value on hover would require state, keep simple for now */}
                                <title>{`Cell ${cells[i]} - Cell ${cells[j]}: ${value.toFixed(3)}`}</title>
                            </g>
                        ))}
                    </g>
                ))}

                {/* Legend */}
                <g transform={`translate(${labelSize}, ${cells.length * cellSize + labelSize + 20})`}>
                    <text x="0" y="0" fill="#94a3b8" fontSize="12" fontWeight="500">
                        Correlation:
                    </text>
                    <text x="0" y="15" fill="#3b82f6" fontSize="11">
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
                    <text x={30 + 10 * 15 + 5} y="15" fill="#ef4444" fontSize="11">
                        High
                    </text>
                </g>
            </svg>
        </div>
    );
}
