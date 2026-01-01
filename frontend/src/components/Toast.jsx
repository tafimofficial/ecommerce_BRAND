import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertOctagon, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    const variants = {
        success: {
            icon: <Check size={18} strokeWidth={3} />,
            bg: 'rgba(236, 253, 245, 0.85)',
            border: '#10b981',
            text: '#064e3b',
            iconBg: '#10b981'
        },
        error: {
            icon: <AlertOctagon size={18} strokeWidth={3} />,
            bg: 'rgba(254, 242, 242, 0.85)',
            border: '#ef4444',
            text: '#7f1d1d',
            iconBg: '#ef4444'
        },
        info: {
            icon: <Info size={18} strokeWidth={3} />,
            bg: 'rgba(239, 246, 255, 0.85)',
            border: '#3b82f6',
            text: '#1e3a8a',
            iconBg: '#3b82f6'
        },
        warning: {
            icon: <AlertTriangle size={18} strokeWidth={3} />,
            bg: 'rgba(255, 251, 235, 0.85)',
            border: '#f59e0b',
            text: '#78350f',
            iconBg: '#f59e0b'
        }
    };

    const style = variants[type] || variants.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            style={{
                pointerEvents: 'auto',
                background: style.bg,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${style.border}`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0,0,0,0.05)',
                padding: '1rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'start',
                gap: '0.875rem',
                minWidth: '320px',
                maxWidth: '420px',
                width: '100%',
                overflow: 'hidden'
            }}
        >
            <div style={{
                flexShrink: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: style.iconBg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '1px'
            }}>
                {style.icon}
            </div>

            <div style={{ flex: 1, paddingTop: '0.15rem' }}>
                <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', fontWeight: 800, color: style.text, textTransform: 'capitalize' }}>
                    {type === 'error' ? 'Something went wrong' : type}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: style.text, opacity: 0.9, lineHeight: 1.4 }}>
                    {message}
                </p>
            </div>

            <button
                onClick={onClose}
                style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: style.text,
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = 1}
                onMouseOut={(e) => e.target.style.opacity = 0.6}
            >
                <X size={16} strokeWidth={2.5} />
            </button>
        </motion.div>
    );
};

export default Toast;
