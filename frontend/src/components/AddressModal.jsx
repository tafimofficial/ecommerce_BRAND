import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';

const AddressModal = ({ isOpen, onClose, addressToEdit = null, onSuccess }) => {
    const { showNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
    });

    useEffect(() => {
        if (addressToEdit) {
            setFormData({
                street_address: addressToEdit.street_address,
                city: addressToEdit.city,
                state: addressToEdit.state,
                postal_code: addressToEdit.postal_code,
                country: addressToEdit.country,
                is_default: addressToEdit.is_default || false
            });
        } else {
            setFormData({
                street_address: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'Bangladesh',
                is_default: false
            });
        }
    }, [addressToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (addressToEdit) {
                await api.patch(`addresses/${addressToEdit.id}/`, formData);
                showNotification('Address updated successfully', 'success');
            } else {
                await api.post('addresses/', formData);
                showNotification('Address added successfully', 'success');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showNotification('Failed to save address', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const modalStyles = isMobile ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        top: '10vh', // Start slightly down
        background: 'white',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '1.5rem',
        zIndex: 10000,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Manage scroll inside content
    } : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        // transform is handled by motion props
        background: 'white',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '85vh',
        zIndex: 10000,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(3px)'
                        }}
                    />
                    <motion.div
                        initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                        style={{
                            ...modalStyles,
                            transform: undefined // Let Framer handle transform
                        }}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: isMobile ? '0 0 1.5rem 0' : '2rem 2rem 1.5rem 2rem',
                            borderBottom: isMobile ? 'none' : '1px solid #f4f4f5',
                            marginBottom: isMobile ? '1rem' : 0
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MapPin className="text-primary" />
                                {addressToEdit ? 'Edit Address' : 'New Address'}
                            </h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '0 0 2rem 0' : '2rem' }}>
                            <form id="address-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={labelStyle}>Street Address</label>
                                    <input
                                        required
                                        name="street_address"
                                        value={formData.street_address}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="123 Example St, Apt 4B"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                                        <label style={labelStyle}>City</label>
                                        <input
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                                        <label style={labelStyle}>State / Province</label>
                                        <input
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                                        <label style={labelStyle}>Postal Code</label>
                                        <input
                                            required
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 150px' }}>
                                        <label style={labelStyle}>Country</label>
                                        <input
                                            required
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={formData.is_default}
                                        onChange={handleChange}
                                        id="is_default"
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                                    />
                                    <label htmlFor="is_default" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3f3f46', cursor: 'pointer' }}>
                                        Set as default shipping address
                                    </label>
                                </div>

                            </form>
                        </div>

                        <div style={{
                            padding: isMobile ? '1rem 0 0 0' : '1.5rem 2rem 2rem 2rem',
                            borderTop: isMobile ? 'none' : '1px solid #f4f4f5',
                            marginTop: isMobile ? '0' : 0,
                            background: 'white',
                            borderBottomLeftRadius: '24px',
                            borderBottomRightRadius: '24px'
                        }}>
                            <button
                                type="submit"
                                form="address-form" // Link button to form by ID
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    borderRadius: '12px'
                                }}
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Address</>}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#71717a', textTransform: 'uppercase' };

export default AddressModal;
