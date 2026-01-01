import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

const Dropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    width = "200px"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close on click outside (Desktop)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !isMobile) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile]);

    const selectedOption = options.find(opt => opt.value === value);

    const toggleOpen = () => setIsOpen(!isOpen);

    const renderMobile = () => (
        createPortal(
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 9998,
                                backdropFilter: 'blur(2px)'
                            }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderTopLeftRadius: '24px',
                                borderTopRightRadius: '24px',
                                zIndex: 9999,
                                padding: '1.5rem',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{placeholder}</h3>
                                <button onClick={() => setIsOpen(false)} style={{ background: '#f4f4f5', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {options.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            border: value === option.value ? '2px solid var(--primary-color)' : '1px solid #e4e4e7',
                                            background: value === option.value ? 'rgba(0,0,0,0.02)' : 'white',
                                            color: value === option.value ? 'var(--primary-color)' : '#18181b',
                                            fontWeight: value === option.value ? 700 : 500,
                                            fontSize: '1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {option.label}
                                        {value === option.value && <Check size={18} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>,
            document.body
        )
    );

    const renderDesktop = () => (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px #f4f4f5',
                        overflow: 'hidden',
                        zIndex: 100
                    }}
                >
                    <div style={{ padding: '0.4rem', maxHeight: '250px', overflowY: 'auto' }}>
                        {options.map((option) => (
                            <motion.div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                whileHover={{
                                    backgroundColor: '#f4f4f5',
                                    color: 'var(--primary-color)'
                                }}
                                style={{
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: value === option.value ? 'var(--primary-color)' : '#52525b',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '2px'
                                }}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} />}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: width, zIndex: isOpen && !isMobile ? 50 : 1 }}>
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={toggleOpen}
                style={{
                    background: 'white',
                    border: isOpen ? '1px solid var(--primary-color)' : '1px solid #e4e4e7',
                    borderRadius: '12px',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                }}
            >
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: selectedOption ? '#18181b' : '#a1a1aa'
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} color="#71717a" />
                </motion.div>
            </motion.div>

            {isMobile ? renderMobile() : renderDesktop()}
        </div>
    );
};

export default Dropdown;
