import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardLoader() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: '#f8fafc'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Animated Logo/Network Icon */}
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                    {/* Ring 1 - Outer */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '2px solid rgba(59, 130, 246, 0.3)',
                            borderTopColor: '#3b82f6',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Ring 2 - Inner */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '15%',
                            left: '15%',
                            width: '70%',
                            height: '70%',
                            borderRadius: '50%',
                            border: '2px solid rgba(6, 182, 212, 0.3)',
                            borderBottomColor: '#06b6d4',
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Center Pulse */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '35%',
                            left: '35%',
                            width: '30%',
                            height: '30%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                        }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Text Content */}
                <div style={{ textAlign: 'center' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: '2rem',
                            fontWeight: '300',
                            margin: '0 0 0.5rem 0',
                            letterSpacing: '1px'
                        }}
                    >
                        NOKIA <span style={{ fontWeight: '700', color: '#3b82f6' }}>NOC</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{ display: 'inline-block', width: 4, height: 4, background: '#06b6d4', borderRadius: '50%' }}></span>
                        Initializing Intelligent Fronthaul System...
                    </motion.p>
                </div>

                {/* Loading Bar */}
                <div style={{
                    width: '300px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <motion.div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, transparent)',
                            position: 'absolute'
                        }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </div>
        </div>
    );
}
