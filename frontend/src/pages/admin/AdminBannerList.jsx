import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, X, Upload, Monitor, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBannerList = () => {
    const [banners, setBanners] = useState([]);
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm } = useModal();
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, [token]);

    const fetchBanners = async () => {
        try {
            const res = await api.get('banners/');
            setBanners(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image && !editingBanner) {
            showNotification('Visual asset required. Please select an image.', 'info');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('link', formData.link);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingBanner) {
                await api.patch(`banners/${editingBanner.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showNotification('Visual canvas synchronized successfully.', 'success');
            } else {
                await api.post('banners/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showNotification('New visual canvas deployed.', 'success');
            }
            setShowForm(false);
            setEditingBanner(null);
            fetchBanners();
            setFormData({ title: '', description: '', link: '', image: null });
        } catch (error) {
            console.error("Submission error", error);
            showNotification('Failed to synchronize visual asset.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            description: banner.description || '',
            link: banner.link || '',
            image: null // Preview will show the existing image
        });
        setShowForm(true);
    };

    const handleToggleActive = async (banner) => {
        try {
            await api.patch(`banners/${banner.id}/`, { is_active: !banner.is_active });
            showNotification(banner.is_active ? 'Visual asset deactivated.' : 'Visual asset activated.', 'success');
            fetchBanners();
        } catch (error) {
            console.error("Toggle failed", error);
            showNotification('Failed to update orchestration status.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm("Confirm Termination", "Terminate this visual asset? This action is irreversible.", "Terminate");
        if (!ok) return;
        try {
            await api.delete(`banners/${id}/`);
            fetchBanners();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Visual Canvas.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Curate high-impact hero banners and promotional visuals.</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditingBanner(null);
                            setFormData({ title: '', description: '', link: '', image: null });
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.9rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'CANCEL OPERATION' : 'ADD VISUAL'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="card"
                        style={{ padding: '2rem', marginBottom: '3rem', background: '#fff', border: '1px solid #f4f4f5' }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{editingBanner ? 'REVISE HEADING' : 'BANNER HEADING'}</span>
                                    <input
                                        placeholder="Enter impact title..."
                                        className="input-field"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </label>
                                <label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>SUB-CAPTION</span>
                                    <textarea
                                        placeholder="Provide context for this visual..."
                                        className="input-field"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    />
                                </label>
                                <label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>DESTINATION LINK</span>
                                    <input
                                        placeholder="e.g. /category/premium"
                                        className="input-field"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', display: 'block', textTransform: 'uppercase' }}>ASSET SELECTION</span>
                                <div style={{
                                    flex: 1,
                                    border: '2px dashed #e4e4e7',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    padding: '2rem',
                                    background: '#fafafa',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }} onClick={() => document.getElementById('banner-file').click()}>
                                    {formData.image ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <ImageIcon size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 700, margin: 0 }}>{formData.image.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{(formData.image.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={48} color="#d4d4d8" />
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontWeight: 800, margin: 0 }}>DRAG OR CLICK TO UPLOAD</p>
                                                <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>High-resolution aspect ratio recommended</p>
                                            </div>
                                        </>
                                    )}
                                    <input id="banner-file" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem', borderRadius: '16px' }} disabled={loading}>
                                    {loading ? 'SYNCHRONIZING ASSET...' : editingBanner ? 'UPDATE VISUAL CANVAS' : 'DEPLOY VISUAL CANVAS'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <AnimatePresence>
                    {banners.length > 0 ? banners.map(banner => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            key={banner.id}
                            className="card"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '2.5rem',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'white',
                                border: '1px solid #f4f4f5'
                            }}
                        >
                            <div style={{ aspectRatio: '21/9', borderRadius: '16px', overflow: 'hidden', background: '#f4f4f5', position: 'relative' }}>
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div
                                    onClick={() => handleToggleActive(banner)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        left: '1rem',
                                        background: banner.is_active ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {banner.is_active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {banner.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', margin: '0 0 0.75rem 0' }}>{banner.title || 'Untitled Motif'}</h3>
                                <p style={{ color: '#71717a', fontSize: '0.95rem', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>{banner.description || 'No descriptive metadata provided.'}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#09090b', fontWeight: 700, fontSize: '0.85rem' }}>
                                    <LinkIcon size={14} color="#71717a" />
                                    <span>DESTINATION:</span>
                                    <span style={{ background: '#f4f4f5', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>{banner.link || '/'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => handleEdit(banner)}
                                    style={{ width: '50px', height: '50px', borderRadius: '14px', border: '1px solid #e4e4e7', background: 'white', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f4f4f5'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <Edit3 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    style={{ width: '50px', height: '50px', borderRadius: '14px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #e4e4e7' }}>
                            <ImageIcon size={64} style={{ color: '#e4e4e7', marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', marginBottom: '0.5rem' }}>Stark Canvas.</h3>
                            <p style={{ color: '#71717a' }}>No high-impact visuals have been deployed to the registry.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div >
    );
};

export default AdminBannerList;
