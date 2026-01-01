import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentStatusPage = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status') || searchParams.get('type');

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                            style={{ color: 'var(--accent-color)', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}
                        >
                            <CheckCircle2 size={120} strokeWidth={1} />
                        </motion.div>
                        <h1 style={{ fontSize: '4rem', letterSpacing: '-3px', marginBottom: '1rem', lineHeight: 1 }}>Acquisition Confirmed.</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '400px', margin: '0 auto 4rem auto' }}>
                            Your order has entered our system. We are preparing your selection for immediate dispatch.
                        </p>
                        <Link to="/shop" className="btn btn-primary" style={{ padding: '1.25rem 3rem', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                            CONTINUE COLLECTING <ArrowRight size={20} />
                        </Link>
                    </div>
                );
            case 'fail':
                return (
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ color: '#ef4444', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}
                        >
                            <XCircle size={120} strokeWidth={1} />
                        </motion.div>
                        <h1 style={{ fontSize: '4rem', letterSpacing: '-3px', marginBottom: '1rem', lineHeight: 1 }}>Transaction Failed.</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '400px', margin: '0 auto 4rem auto' }}>
                            We encountered an obstruction during verification. Please re-evaluate your payment details.
                        </p>
                        <Link to="/cart" className="btn btn-primary" style={{ padding: '1.25rem 3rem' }}>
                            RETURN TO INVENTORY
                        </Link>
                    </div>
                );
            case 'cancel':
                return (
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ color: 'var(--primary-color)', opacity: 0.3, marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}
                        >
                            <AlertCircle size={120} strokeWidth={1} />
                        </motion.div>
                        <h1 style={{ fontSize: '4rem', letterSpacing: '-3px', marginBottom: '1rem', lineHeight: 1 }}>Process Paused.</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '400px', margin: '0 auto 4rem auto' }}>
                            The transaction was suspended per your request. Your selection remains reserved in your cart.
                        </p>
                        <Link to="/cart" className="btn btn-primary" style={{ padding: '1.25rem 3rem' }}>
                            RESTORE CART
                        </Link>
                    </div>
                );
            default:
                return (
                    <div style={{ textAlign: 'center' }}>
                        <ShoppingBag size={80} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                        <h1 style={{ fontSize: '3rem', letterSpacing: '-2px', marginBottom: '2rem' }}>State Undefined.</h1>
                        <Link to="/" className="btn btn-primary" style={{ padding: '1.2rem 3rem' }}>RETURN TO STORE</Link>
                    </div>
                );
        }
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '8rem 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ padding: '5rem', background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--border-radius-lg)' }}
                >
                    {renderContent()}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;
