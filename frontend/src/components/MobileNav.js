'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MobileNav({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'dashboard', label: 'Home', icon: '🏠' },
        { id: 'analytics', label: 'Monitor', icon: '📊' },
        { id: 'assistant', label: 'AI Chat', icon: '🤖' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px', // Taller for better touch target + safe area
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom)', // Safe area for iPhone home bar
            zIndex: 1000,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
        }}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            position: 'relative',
                            color: isActive ? '#06b6d4' : '#64748b',
                            cursor: 'pointer',
                            paddingTop: '10px'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    width: '40%',
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                                    borderRadius: '0 0 4px 4px',
                                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)'
                                }}
                            />
                        )}
                        <span style={{ fontSize: '1.5rem', marginBottom: '4px', filter: isActive ? 'drop-shadow(0 0 5px rgba(6,182,212,0.5))' : 'none' }}>
                            {tab.icon}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: isActive ? '600' : '400' }}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
