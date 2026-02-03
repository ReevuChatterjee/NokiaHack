'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSkeleton({ type = 'card' }) {
    if (type === 'card') {
        return (
            <motion.div
                className="card"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div style={{
                    width: '60%',
                    height: '20px',
                    background: 'rgba(148, 163, 184, 0.2)',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }} />
                <div style={{
                    width: '100%',
                    height: '100px',
                    background: 'rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px'
                }} />
            </motion.div>
        );
    }

    if (type === 'chart') {
        return (
            <motion.div
                style={{
                    width: '100%',
                    height: '400px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                }}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                    <div>Loading visualization...</div>
                </div>
            </motion.div>
        );
    }

    return null;
}
