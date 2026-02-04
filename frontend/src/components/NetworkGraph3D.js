import React, { useEffect, useRef, useState, forwardRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph2D = forwardRef(({ topology }, ref) => {
    const fgRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [selectedNode, setSelectedNode] = useState(null);

    // Consistent color generator based on string hash
    const getLinkColor = (id) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    useEffect(() => {
        if (!topology || !topology.links) return;

        const nodes = [];
        const linksArray = [];

        // Layout Config
        const HUB_DISTANCE = 180; // Distance of hubs from center
        const CELL_DISTANCE = 50; // Distance of cells from relative hub

        const linkKeys = Object.keys(topology.links);

        linkKeys.forEach((linkId, i) => {
            const linkData = topology.links[linkId];
            const color = getLinkColor(linkId);

            // 1. Position Link Hubs in a Polygon around (0,0)
            const hubAngle = (i * 2 * Math.PI) / linkKeys.length - (Math.PI / 2);
            const hubX = Math.cos(hubAngle) * HUB_DISTANCE;
            const hubY = Math.sin(hubAngle) * HUB_DISTANCE;

            // Add Hub Node
            nodes.push({
                id: linkId,
                name: linkId,
                label: linkId.replace('_', ' '),
                type: 'link',
                cells: linkData.cells,
                val: 30,
                color: color,
                avgThroughput: linkData.avg_throughput_mbps,
                peakThroughput: linkData.peak_throughput_mbps,
                fx: hubX,
                fy: hubY,
                x: hubX,
                y: hubY
            });

            // 2. Position Cells around their Hub
            if (linkData.cells) {
                linkData.cells.forEach((cellId, j) => {
                    const cellLabel = String(cellId);
                    const cellNodeId = `Cell_${cellLabel}_${linkId}`; // Unique ID
                    const totalCells = linkData.cells.length;
                    const cellAngle = (j * 2 * Math.PI) / totalCells;

                    const cellX = hubX + Math.cos(cellAngle) * CELL_DISTANCE;
                    const cellY = hubY + Math.sin(cellAngle) * CELL_DISTANCE;

                    nodes.push({
                        id: cellNodeId,
                        name: `Cell ${cellLabel}`,
                        label: cellLabel,
                        type: 'cell',
                        val: 10,
                        color: color,
                        parentId: linkId,
                        fx: cellX,
                        fy: cellY,
                        x: cellX,
                        y: cellY
                    });

                    linksArray.push({
                        source: linkId,
                        target: cellNodeId,
                        color: color,
                        width: 2
                    });
                });
            }
        });

        setGraphData({ nodes, links: linksArray });

        // Initial placement boost
        setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.zoomToFit(400, 100);
                fgRef.current.centerAt(0, 0, 600);
            }
        }, 500); // Increased timeout for reliable DOM measurements
    }, [topology]);

    const handleNodeClick = (node) => {
        if (!node) return;
        setSelectedNode(node);
        const connectedNodes = new Set();
        const connectedLinks = new Set();

        if (node.type === 'link') {
            connectedNodes.add(node.id);
            graphData.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (sourceId === node.id) {
                    connectedNodes.add(targetId);
                    connectedLinks.add(link);
                }
            });
        } else {
            connectedNodes.add(node.id);
            if (node.parentId) connectedNodes.add(node.parentId);
            graphData.links.forEach(link => {
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (targetId === node.id) {
                    connectedLinks.add(link);
                }
            });
        }
        setHighlightNodes(connectedNodes);
        setHighlightLinks(connectedLinks);
    };

    const handleBackgroundClick = () => {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        setSelectedNode(null);
    };

    const paintNode = (node, ctx, globalScale) => {
        const isHighlight = highlightNodes.size === 0 || highlightNodes.has(node.id);
        const opacity = isHighlight ? 1 : 0.2;

        if (node.type === 'link') {
            const size = node.val;
            ctx.fillStyle = node.color;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.roundRect(node.x - size / 2, node.y - size / 2, size, size, 5);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = isHighlight ? 2 : 1;
            ctx.stroke();
            const fontSize = 16 / globalScale;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y + size / 2 + fontSize + 4);
        } else {
            const size = node.val;
            ctx.fillStyle = node.color;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = isHighlight ? 2 : 1;
            ctx.stroke();
            if (globalScale > 0.8) {
                const fontSize = 10 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label, node.x, node.y);
            }
        }
        ctx.globalAlpha = 1.0;
    };

    const renderBackground = (ctx, globalScale) => {
        const linkKeys = Object.keys(topology?.links || {});
        const HUB_DISTANCE = 180;

        linkKeys.forEach((linkId, i) => {
            const color = getLinkColor(linkId);
            const hubAngle = (i * 2 * Math.PI) / linkKeys.length - (Math.PI / 2);
            const hubX = Math.cos(hubAngle) * HUB_DISTANCE;
            const hubY = Math.sin(hubAngle) * HUB_DISTANCE;

            ctx.beginPath();
            ctx.arc(hubX, hubY, 80, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.05;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1.0;
        });
    };

    return (
        <div ref={ref} style={{
            width: '100%',
            height: '600px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 100%)', pointerEvents: 'none', zIndex: 10 }}>
                <h3 style={{ color: '#8b5cf6', fontSize: '1.1rem', margin: 0 }}>Fronthaul Topology Map</h3>
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '8px', zIndex: 10 }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Legend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}><div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '2px solid white', background: '#3b82f6' }}></div><span style={{ fontSize: '0.8rem', color: '#f1f5f9' }}>Fronthaul Link</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid white', background: '#3b82f6' }}></div><span style={{ fontSize: '0.8rem', color: '#f1f5f9' }}>Cell Site</span></div>
            </div>

            {selectedNode && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '250px', background: 'rgba(15, 23, 42, 0.9)', padding: '1rem', borderRadius: '8px', border: '1px solid #3b82f6', zIndex: 20 }}>
                    <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{selectedNode.type === 'link' ? `📡 ${selectedNode.label}` : `📱 Cell ${selectedNode.label}`}</strong>
                    {selectedNode.type === 'link' && <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}><div>Connected Cells: {selectedNode.cells.length}</div></div>}
                </div>
            )}

            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeRelSize={6}
                nodeCanvasObject={paintNode}
                onRenderFramePre={renderBackground}
                linkWidth={link => (highlightLinks.size === 0 || highlightLinks.has(link)) ? 2 : 1}
                linkColor={link => (highlightLinks.size === 0 || highlightLinks.has(link)) ? link.color : `${link.color}20`}
                onNodeClick={handleNodeClick}
                onBackgroundClick={handleBackgroundClick}
                backgroundColor="rgba(0,0,0,0)"
                enableNodeDrag={false}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                cooldownTicks={0}
            />
        </div>
    );
});

NetworkGraph2D.displayName = 'NetworkGraph2D';
export default NetworkGraph2D;
