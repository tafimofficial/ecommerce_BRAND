import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            showNotification('Welcome! Your profile has been created.', 'success');
            navigate('/');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '500px', padding: '0 1rem' }}
            >
                <div className="card auth-padding" style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--border-radius-lg)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '3.5rem', letterSpacing: '-3px', marginBottom: '0.5rem', lineHeight: 1 }}>Join Us.</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Create your profile to start your collection.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-field"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '3rem' }}
                                    required
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input-field"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                name="password"
                                type="password"
                                placeholder="Secure Password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ paddingLeft: '3rem' }}
                                required
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            CREATE PROFILE <ArrowRight size={18} />
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--gray-50)', paddingTop: '2.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Already a member? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 800 }}>IDENTIFY YOURSELF</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
