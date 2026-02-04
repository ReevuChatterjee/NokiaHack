'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useDashboard } from '../context/DashboardContext';

import config from '../config';

const API_BASE_URL = config.apiBaseUrl;

export default function AIChatPanel() {
    const { topology, capacitySummary, trafficData } = useDashboard();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your NOC AI Assistant. I have access to your live network data. How can I help you optimize the fronthaul?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);
    const [modelName, setModelName] = useState('llama3');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Prepare context data
        const contextData = {
            topology_summary: topology ? {
                link_count: Object.keys(topology.links).length,
                cell_count: Object.values(topology.links).reduce((sum, link) => sum + link.cells.length, 0)
            } : 'Not loaded',
            capacity_issues: capacitySummary ? capacitySummary.filter(l => parseFloat(l.peak_gbps) > 10000).map(l => ({
                link_id: l.link_id,
                peak_gbps: l.peak_gbps,
                recommendation: "High traffic - needs buffering"
            })) : [],
            traffic_snapshot: trafficData ? trafficData.slice(0, 5) : "No recent traffic"
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat`, {
                messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                model: modelName,
                context_data: contextData
            });

            const aiMsg = response.data;
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${err.response?.data?.detail || "Could not connect to AI. Is Ollama running locally?"}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* Settings Toggle */}
            <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                <button
                    onClick={() => setConfigOpen(!configOpen)}
                    className="glass-btn"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                    ⚙️ Config
                </button>
            </div>

            {/* Config Panel */}
            <AnimatePresence>
                {configOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: 0,
                            background: '#1e293b',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            padding: '1rem',
                            zIndex: 20,
                            width: '250px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#f1f5f9' }}>Settings</h4>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            Ollama Model Name
                        </label>
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '0.85rem'
                            }}
                            placeholder="e.g., llama3"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                            border: msg.role === 'user' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
                            color: '#f1f5f9',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                marginBottom: '0.25rem',
                                fontWeight: 'bold'
                            }}>
                                NOC AI
                            </div>
                        )}
                        {msg.content}
                    </motion.div>
                ))}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.85rem', marginLeft: '1rem' }}
                    >
                        Generating response...
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about network congestion, optimization..."
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '0.9rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="glass-btn"
                    style={{
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}
