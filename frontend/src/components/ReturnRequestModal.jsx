import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';

const ReturnRequestModal = ({ isOpen, onClose, order, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotifications();

    if (!isOpen || !order) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('order', order.id);
        formData.append('reason', reason);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('returns/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification('Return request submitted successfully.', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showNotification('Failed to submit return request.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backdropFilter: 'blur(3px)', background: 'rgba(0,0,0,0.5)'
                }}
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                onClick={e => e.stopPropagation()}
                className="card"
                style={{
                    position: 'fixed', top: '50%', left: '50%',
                    width: '90%', maxWidth: '500px', background: 'white',
                    padding: '2rem', borderRadius: '24px', zIndex: 10000,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Request Return</h2>
                <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Order #{order.id} - Please detail the reason for your return.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reason for Return</label>
                        <textarea
                            className="input-field"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe the issue..."
                            required
                            rows={4}
                            style={{ width: '100%', resize: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload Image (Optional)</label>
                        <div
                            style={{
                                border: '2px dashed #e4e4e7', borderRadius: '12px', padding: '2rem',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                cursor: 'pointer', background: image ? '#f0fdf4' : 'transparent',
                                borderColor: image ? '#10b981' : '#e4e4e7'
                            }}
                            onClick={() => document.getElementById('return-image').click()}
                        >
                            <Upload size={24} color={image ? '#10b981' : '#a1a1aa'} />
                            <span style={{ fontSize: '0.9rem', color: image ? '#10b981' : '#71717a' }}>
                                {image ? image.name : 'Click to upload proof'}
                            </span>
                            <input
                                type="file"
                                id="return-image"
                                hidden
                                accept="image/*"
                                onChange={e => setImage(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Submit Request
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReturnRequestModal;
