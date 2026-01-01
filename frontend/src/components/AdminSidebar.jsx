import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, List, LogOut, Package, Image, Settings, Tag, Truck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/admin-panel', icon: <LayoutDashboard size={20} /> },
        { label: 'Products', path: '/admin-panel/products', icon: <Package size={20} /> },
        { label: 'Categories', path: '/admin-panel/categories', icon: <List size={20} /> },
        { label: 'Orders', path: '/admin-panel/orders', icon: <ShoppingBag size={20} /> },
        { label: 'Returns', path: '/admin-panel/returns', icon: <div style={{ transform: 'rotate(180deg)' }}><LogOut size={20} /></div> },
        { label: 'Banners', path: '/admin-panel/banners', icon: <Image size={20} /> },
        { label: 'Coupons', path: '/admin-panel/coupons', icon: <Tag size={20} /> },
        { label: 'Delivery', path: '/admin-panel/delivery', icon: <Truck size={20} /> },
        { label: 'Settings', path: '/admin-panel/settings', icon: <Settings size={20} /> },
    ];

    return (
        <>
            {/* Backdrop for Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 999,
                            backdropFilter: 'blur(4px)'
                        }}
                        className="mobile-backdrop"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`admin-sidebar ${isOpen ? 'open' : ''}`}
                style={{
                    background: '#09090b',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #18181b',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div style={{ padding: '2rem', borderBottom: '1px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-1px', color: 'var(--accent-color)', margin: 0 }}>
                        ADMIN<span style={{ color: 'white' }}>SPACE.</span>
                    </h2>
                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="desktop-only"
                        style={{ background: 'transparent', color: 'white', display: isOpen ? 'block' : 'none', '@media (min-width: 769px)': { display: 'none' } }}
                    >
                        {/* We handle display none via CSS classes usually, but for now inline simple logic */}
                    </button>
                    <div className="md:hidden" style={{ display: 'none' }}>
                        {/* Hidden on desktop, shown on mobile via CSS media queries if we add utility classes, 
                            but here we rely on the `admin-sidebar` class interacting with global css media queries 
                         */}
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem', overflowY: 'auto' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/admin-panel' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                                    <Link
                                        to={item.path}
                                        onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.85rem 1.25rem',
                                            borderRadius: '12px',
                                            color: isActive ? 'white' : '#71717a',
                                            textDecoration: 'none',
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.95rem',
                                            background: isActive ? '#18181b' : 'transparent',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            border: isActive ? '1px solid #27272a' : '1px solid transparent'
                                        }}
                                        className="admin-nav-item"
                                    >
                                        <span style={{ color: isActive ? 'var(--accent-color)' : 'inherit' }}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #18181b', background: '#09090b' }}>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            cursor: 'pointer',
                            padding: '0.85rem 1.25rem',
                            width: '100%',
                            textAlign: 'left',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                    <Link to="/" style={{ display: 'block', marginTop: '1.5rem', color: '#52525b', fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}>
                        View Storefront
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
