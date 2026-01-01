import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Package, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`orders/${orderId}/`)
            .then(res => {
                setOrder(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [orderId]);

    const handlePayment = async (method) => {
        try {
            const updateData = {
                payment_method: method
            };

            if (method === 'Online') {
                const res = await api.post('payment/init/', { order_id: orderId });
                if (res.data.gateway_url) {
                    window.location.href = res.data.gateway_url;
                } else {
                    alert('Failed to initiate online payment.');
                }
                return;
            }

            await api.patch(`orders/${orderId}/`, updateData);
            navigate('/payment/status?type=success&method=COD');
        } catch (error) {
            console.error(error);
            alert('Failed to process payment selection.');
        }
    };

    if (loading) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.3 }}>PREPARING SECURE GATEWAY...</h2>
        </div>
    );

    if (!order) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.3 }}>ORDER NOT FOUND.</h2>
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '6rem 0' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center' }}
                >
                    <h1 style={{ fontSize: '4rem', letterSpacing: '-3px', marginBottom: '1.5rem', lineHeight: 1 }}>Final Selection.</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4rem' }}>
                        Choose your preferred method to finalize your acquisition of <strong>৳{order.total_price}</strong>.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePayment('Online')}
                            style={{
                                padding: '2rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                borderRadius: 'var(--border-radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                                    <CreditCard size={30} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <span style={{ display: 'block', fontWeight: 800, fontSize: '1.25rem' }}>ONLINE PAYMENT</span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Cards, SSLCommerz, Mobile Banking</span>
                                </div>
                            </div>
                            <ChevronRight size={24} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePayment('COD')}
                            style={{
                                padding: '2rem',
                                background: 'white',
                                color: 'var(--primary-color)',
                                borderRadius: 'var(--border-radius-md)',
                                border: '2px solid var(--gray-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: '12px' }}>
                                    <Package size={30} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <span style={{ display: 'block', fontWeight: 800, fontSize: '1.25rem' }}>CASH ON DELIVERY</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay upon physical reception</span>
                                </div>
                            </div>
                            <ChevronRight size={24} />
                        </motion.button>
                    </div>

                    <p style={{ marginTop: '4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        All transactions are encrypted and secured. By proceeding, you agree to our Terms of Acquisition.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;
