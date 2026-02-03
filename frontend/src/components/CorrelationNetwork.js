'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function CorrelationNetwork({ cells, matrix }) {
    const [threshold, setThreshold] = useState(0.7);
    const [selectedCell, setSelectedCell] = useState(null);
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    // Stats calculation
    const stats = useMemo(() => {
        if (!cells || !matrix) return { linkCount: 0, avgCorrelation: 0, maxCorrelation: 0 };
        let count = 0;
        let sum = 0;
        let max = 0;

        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                const val = matrix[i][j];
                if (val >= threshold && !isNaN(val)) {
                    count++;
                    sum += val;
                    if (val > max) max = val;
                }
            }
        }
        return {
            linkCount: count,
            avgCorrelation: count > 0 ? sum / count : 0,
            maxCorrelation: max
        };
    }, [cells, matrix, threshold]);

    // Main drawing logic
    useEffect(() => {
        if (!canvasRef.current || !wrapperRef.current || !cells) return;

        const canvas = canvasRef.current;
        const width = wrapperRef.current.clientWidth;
        const height = wrapperRef.current.clientHeight;

        const ctx = canvas.getContext('2d');

        // Setup high-DPI canvas
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Layout Config
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35; // Size of circle

        // 1. Calculate Node Positions (Circular)
        const nodes = cells.map((cell, i) => {
            const angle = (i * 2 * Math.PI) / cells.length - Math.PI / 2;
            return {
                id: cell,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                angle,
                index: i
            };
        });

        // 2. Clear Canvas
        ctx.clearRect(0, 0, width, height);

        // 3. Draw Links (Chords)
        ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow

        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                const val = matrix[i][j];
                if (val >= threshold && !isNaN(val)) {
                    const source = nodes[i];
                    const target = nodes[j];

                    // Opacity logic: Dim unconnected if something is selected
                    let opacity = (val - threshold) / (1 - threshold) * 0.8 + 0.2;
                    if (selectedCell) {
                        const isConnected = selectedCell === source.id || selectedCell === target.id;
                        if (!isConnected) opacity *= 0.1; // Fade out unrelated
                        else opacity = Math.min(1, opacity + 0.3); // Highlight related
                    }

                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);

                    // Curve control point is center (0,0) relative to nodes
                    ctx.quadraticCurveTo(centerX, centerY, target.x, target.y);

                    // Color ramp
                    let color;
                    if (val >= 0.9) color = `rgba(239, 68, 68, ${opacity})`;   // Red
                    else if (val >= 0.8) color = `rgba(249, 115, 22, ${opacity})`; // Orange
                    else if (val >= 0.7) color = `rgba(234, 179, 8, ${opacity})`;  // Yellow
                    else color = `rgba(59, 130, 246, ${opacity})`;                 // Blue (Default Theme)

                    // Theme Override (Cyan/Violet)
                    if (val >= 0.9) color = `rgba(6, 182, 212, ${opacity})`;    // Cyan (High)
                    else if (val >= 0.7) color = `rgba(139, 92, 246, ${opacity})`; // Violet (Med)

                    ctx.strokeStyle = color;
                    ctx.lineWidth = selectedCell && opacity > 0.5 ? 2 : 1;
                    ctx.stroke();
                }
            }
        }

        ctx.globalCompositeOperation = 'source-over';

        // 4. Draw Nodes
        nodes.forEach((node) => {
            const isSelected = selectedCell === node.id;

            // Dim logic
            let alpha = 1;
            if (selectedCell && !isSelected) {
                // Check correlation in matrix (symmetric)
                const idx1 = nodes.find(n => n.id === selectedCell).index;
                const idx2 = node.index;
                const corr = Math.max(matrix[idx1][idx2], matrix[idx2][idx1]); // Ensure access
                if (corr < threshold) alpha = 0.2;
            }

            // Dot
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = isSelected ? '#06b6d4' : `rgba(139, 92, 246, ${alpha})`;
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();

            // Label (Rotated outward)
            ctx.save();
            ctx.translate(node.x, node.y);
            ctx.rotate(node.angle);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isSelected ? '#fff' : `rgba(255, 255, 255, ${alpha})`;
            ctx.font = isSelected ? 'bold 12px Inter' : '11px Inter';
            ctx.fillText(`  ${node.id}`, 8, 0); // Offset from dot
            ctx.restore();
        });

    }, [cells, matrix, threshold, selectedCell]); // Ideally listen to resize, but for now init is fine

    // Handle Canvas Click for Selection
    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        // Find closest node
        let clickedNode = null;
        cells.forEach((cell, i) => {
            const angle = (i * 2 * Math.PI) / cells.length - Math.PI / 2;
            const nx = centerX + Math.cos(angle) * radius;
            const ny = centerY + Math.sin(angle) * radius;

            const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
            if (dist < 20) { // Hitbox
                clickedNode = cell;
            }
        });

        setSelectedCell(clickedNode === selectedCell ? null : clickedNode);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Controls */}
            <div style={{
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                marginBottom: '0.5rem',
                flexShrink: 0
            }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>🎯 Min Strength: {threshold.toFixed(2)}</span>
                        <span>{stats.linkCount} Links</span>
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="0.99"
                        step="0.01"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', flexShrink: 0, textAlign: 'center' }}>
                Select a node to filter connections.
            </p>

            {/* Network Canvas */}
            <div ref={wrapperRef} style={{ flex: 1, width: '100%', minHeight: 0, background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', cursor: 'pointer', overflow: 'hidden' }}>
                <canvas ref={canvasRef} onClick={handleCanvasClick} />
            </div>

            {/* Legend */}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, background: '#06b6d4', borderRadius: '50%' }} /><span style={{ fontSize: '0.8rem' }}>High</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, background: '#8b5cf6', borderRadius: '50%' }} /><span style={{ fontSize: '0.8rem' }}>Med</span></div>
            </div>

        </div>
    );
}
