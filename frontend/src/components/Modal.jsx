import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, HelpCircle, Info } from 'lucide-react';

const Modal = ({ isOpen, title, message, type = 'confirm', defaultValue = '', onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) setInputValue(defaultValue);
    }, [isOpen, defaultValue]);

    const icons = {
        confirm: <HelpCircle size={32} color="#3b82f6" />,
        alert: <AlertTriangle size={32} color="#f59e0b" />,
        prompt: <Info size={32} color="#10b981" />,
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '2.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}
                >
                    <button
                        onClick={onCancel}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#f8fafc',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            {icons[type]}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#09090b', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{title}</h3>
                        <p style={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.5 }}>{message}</p>
                    </div>

                    {type === 'prompt' && (
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                autoFocus
                                className="input-field"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 }}
                                onKeyDown={(e) => e.key === 'Enter' && onConfirm(inputValue)}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '14px',
                                border: '1px solid #e4e4e7',
                                background: 'white',
                                color: '#71717a',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => onConfirm(type === 'prompt' ? inputValue : true)}
                            style={{
                                flex: 2,
                                padding: '1rem',
                                borderRadius: '14px',
                                border: 'none',
                                background: '#09090b',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Modal;
