import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const BASE_URL = `http://${window.location.hostname}:8000`;
    const [shippingCost, setShippingCost] = useState(0);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/site-settings/`);
                if (response.data && response.data.delivery_charge) {
                    setShippingCost(parseFloat(response.data.delivery_charge));
                }
            } catch (error) {
                console.error('Error fetching site settings:', error);
            }
        };
        fetchSettings();
    }, []);

    if (cart.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container"
                style={{ padding: '10rem 1rem', textAlign: 'center' }}
            >
                <ShoppingBag size={80} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '3rem', letterSpacing: '-2px', marginBottom: '1rem' }}>Empty Collection.</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Your inventory is currently empty. Define your style today.</p>
                <Link to="/shop" className="btn btn-primary" style={{ padding: '1.2rem 3rem' }}>
                    EXPLORE DESIGNS
                </Link>
            </motion.div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '4rem 0' }}>
            <div className="container">
                <header style={{ marginBottom: '4rem' }}>
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ fontSize: '5rem', letterSpacing: '-4px', lineHeight: 1 }}
                    >
                        Your Cart.
                    </motion.h1>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'start' }}>
                    {/* Items List */}
                    <div style={{ flex: 2 }}>
                        <AnimatePresence>
                            {cart.map((item, idx) => (
                                <motion.div
                                    key={item.cartId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        padding: '1.5rem',
                                        background: 'white',
                                        borderRadius: 'var(--border-radius-md)',
                                        border: '1px solid var(--gray-100)',
                                        marginBottom: '1.5rem',
                                        alignItems: 'center',
                                        gap: '1.5rem'
                                    }}
                                >
                                    <div style={{ width: '100px', height: '100px', background: 'var(--gray-50)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                        {item.image && (
                                            <img
                                                src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>

                                    <div style={{ flex: '1 1 200px' }}>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{item.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {item.size && <span style={{ marginRight: '1rem' }}>Size: <b>{item.size}</b></span>}
                                            {item.color && <span>Color: <b>{item.color}</b></span>}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>৳{item.price}</p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--gray-50)', borderRadius: '50px', padding: '0.5rem' }}>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}
                                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                        >
                                            <Minus size={16} />
                                        </motion.button>
                                        <span style={{ padding: '0 1rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}
                                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                        >
                                            <Plus size={16} />
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ color: '#ef4444' }}
                                        style={{ background: 'transparent', color: 'var(--text-muted)', marginLeft: 'auto' }}
                                        onClick={() => removeFromCart(item.cartId)}
                                    >
                                        <Trash2 size={24} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ position: 'sticky', top: '100px' }}
                    >
                        <div className="card" style={{ padding: '3rem', border: '5px solid var(--primary-color)', borderRadius: 'var(--border-radius-lg)' }}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', letterSpacing: '-2px' }}>Inventory Summary.</h2>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Inventory Subtotal</span>
                                <span style={{ fontWeight: 700 }}>৳{getCartTotal().toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Premium Shipping</span>
                                <span style={{ fontWeight: 700 }}>
                                    {shippingCost > 0 ? `৳${shippingCost}` : 'FREE'}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '2rem 0',
                                padding: '2rem 0',
                                borderTop: '1px solid var(--gray-100)',
                                borderBottom: '1px solid var(--gray-100)'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 500 }}>Total Value</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                    ৳{(getCartTotal() + parseFloat(shippingCost || 0)).toFixed(2)}
                                </span>
                            </div>

                            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}>
                                SECURE CHECKOUT
                            </Link>

                            <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Taxes calculated at checkout.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
