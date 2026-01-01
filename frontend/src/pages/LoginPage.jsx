import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { showNotification } = useNotifications();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            showNotification('Welcome back!', 'success');
            navigate('/');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div className="card auth-padding" style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--border-radius-lg)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '3.5rem', letterSpacing: '-3px', marginBottom: '0.5rem', lineHeight: 1 }}>Welcome.</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Enter your credentials to access the vault.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '3.5rem' }}
                                required
                            />
                        </div>
                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Security Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '3.5rem' }}
                                required
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            ACCESS ACCOUNT <ArrowRight size={18} />
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--gray-50)', paddingTop: '2.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            New here? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 800 }}>CREATE PROFILE</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
