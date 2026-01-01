import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import api from '../../api/axios';
import { Save, RefreshCcw, Plus, Trash2, ExternalLink, ChevronDown, ChevronUp, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
    const { settings, footerSections, refreshSettings, loading: contextLoading } = useSettings();
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm, prompt: customPrompt } = useModal();
    const [formData, setFormData] = useState({ ...settings });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!contextLoading) {
            setFormData({ ...settings });
        }
    }, [settings, contextLoading]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('site-settings/1/', formData, {
                headers: { Authorization: `Token ${token}` }
            });
            showNotification('Site configurations synchronized successfully.', 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Failed to synchronize configurations.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Footer Management Logic
    const handleAddSection = async () => {
        const name = await customPrompt("New Column", "Enter identifier for footer column:");
        if (!name) return;
        try {
            await api.post('footer-sections/', { name, priority: footerSections.length });
            showNotification(`Column "${name}" initialized.`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Initialization failed.', 'error');
        }
    };

    const handleEditSection = async (section) => {
        const name = await customPrompt("Rename Column", "Update column identifier:", section.name);
        if (!name || name === section.name) return;
        try {
            await api.patch(`footer-sections/${section.id}/`, { name });
            showNotification(`Column renamed to "${name}".`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Update failed.', 'error');
        }
    };

    const handleDeleteSection = async (id, name) => {
        const ok = await confirm("Confirm Termination", `Are you sure you want to terminate "${name}" and all associated links?`, "Terminate");
        if (!ok) return;
        try {
            await api.delete(`footer-sections/${id}/`);
            showNotification(`Column "${name}" terminated.`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Termination failed.', 'error');
        }
    };

    const handleAddLink = async (sectionId) => {
        const name = await customPrompt("Deploy Link", "Enter label for the new destination:");
        if (!name) return;
        const url = await customPrompt("Destination Path", `Enter URL for "${name}":`, "/");
        if (!url) return;

        try {
            await api.post('footer-links/', { section: sectionId, name, url, priority: 0 });
            showNotification(`Link "${name}" deployed.`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Deployment failed.', 'error');
        }
    };

    const handleEditLink = async (link) => {
        const name = await customPrompt("Modify Link Label", "Update label:", link.name);
        if (!name) return;
        const url = await customPrompt("Modify Destination", "Update URL path:", link.url);
        if (!url) return;

        try {
            await api.patch(`footer-links/${link.id}/`, { name, url });
            showNotification(`Link "${name}" re-synchronized.`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Update failed.', 'error');
        }
    };

    const handleDeleteLink = async (id, name) => {
        const ok = await confirm("Eradicate Link", `Are you sure you want to eradicate "${name}"?`, "Eradicate");
        if (!ok) return;
        try {
            await api.delete(`footer-links/${id}/`);
            showNotification(`Link "${name}" eradicated.`, 'success');
            refreshSettings();
        } catch (error) {
            showNotification('Eradication failed.', 'error');
        }
    };

    if (contextLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading configurations...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Hub Controls.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Synchronize your brand's global identity and contact nexus.</p>
                </div>
                <button
                    onClick={refreshSettings}
                    style={{ background: '#f4f4f5', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#71717a', fontWeight: 700, fontSize: '0.85rem' }}
                >
                    <RefreshCcw size={16} /> RE-SYNC
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                {/* section 01 - 03 ... */}
                <div className="card" style={{ padding: '4rem', background: 'white', border: '1px solid #f4f4f5' }}>
                    <div style={{ display: 'grid', gap: '3rem' }}>
                        <section>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: '#f4f4f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>01</div>
                                CORE IDENTITY
                            </h3>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>OFFICIAL BRAND NAME</span>
                                    <input className="input-field" name="brand_name" value={formData.brand_name} onChange={handleChange} style={{ fontSize: '1.1rem', fontWeight: 700 }} />
                                </label>
                                <label style={{ display: 'block' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>MANIFESTO / ABOUT</span>
                                    <textarea className="input-field" name="about_text" value={formData.about_text} onChange={handleChange} style={{ height: '120px', resize: 'vertical' }} />
                                </label>
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: '#f4f4f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>02</div>
                                CONNECTIVITY NEXUS
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                <label><span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>EMAIL DISPATCH</span>
                                    <input className="input-field" name="footer_email" type="email" value={formData.footer_email} onChange={handleChange} />
                                </label>
                                <label><span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>COMMUNICATION LINE</span>
                                    <input className="input-field" name="footer_phone" value={formData.footer_phone} onChange={handleChange} />
                                </label>
                            </div>
                            <label style={{ display: 'block', marginTop: '2rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>PHYSICAL HEADQUARTERS</span>
                                <input className="input-field" name="footer_address" value={formData.footer_address} onChange={handleChange} />
                            </label>

                            <div style={{ marginTop: '2rem' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>RETURN WINDOW (DAYS)</span>
                                    <input
                                        type="number"
                                        className="input-field"
                                        name="return_window_days"
                                        value={formData.return_window_days}
                                        onChange={handleChange}
                                        style={{ maxWidth: '150px' }}
                                    />
                                    <small style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                                        Days after delivery allowing return requests.
                                    </small>
                                </label>
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: '#f4f4f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>03</div>
                                SOCIAL CHANNELS
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {['instagram_url', 'twitter_url', 'facebook_url'].map(key => (
                                    <label key={key}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#a1a1aa', marginBottom: '0.5rem', display: 'block' }}>{key.replace('_url', '').toUpperCase()}</span>
                                        <input className="input-field" name={key} value={formData[key]} onChange={handleChange} />
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} type="submit" className="btn btn-primary" style={{ padding: '1.25rem 4rem', borderRadius: '16px' }}>
                            {saving ? 'SYNCHRONIZING...' : <><Save size={18} /> COMMIT IDENTITY CONFIG</>}
                        </motion.button>
                    </div>
                </div>
            </form >

            <div style={{ marginTop: '3rem' }}>
                <div className="card" style={{ padding: '3rem', background: '#fff', border: '1px solid #f4f4f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#09090b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#09090b', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>04</div>
                            NAVIGATION ARCHITECTURE (FOOTER)
                        </h3>
                        <button onClick={handleAddSection} className="btn" style={{ background: '#f4f4f5', color: '#09090b', fontSize: '0.8rem', fontWeight: 900, padding: '0.6rem 1.25rem', borderRadius: '10px' }}>
                            <Plus size={16} /> ADD COLUMN
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {footerSections.map(section => (
                            <motion.div layout key={section.id} style={{ border: '1px solid #f4f4f5', borderRadius: '16px', padding: '1.5rem', background: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{section.name}</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditSection(section)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.25rem' }}><Edit3 size={15} /></button>
                                        <button onClick={() => handleDeleteSection(section.id, section.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    {section.links.map(link => (
                                        <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #f4f4f5' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{link.name}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditLink(link)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><Edit3 size={12} /></button>
                                                <button onClick={() => handleDeleteLink(link.id, link.name)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {section.links.length === 0 && <div style={{ fontSize: '0.8rem', color: '#a1a1aa', textAlign: 'center', padding: '1rem' }}>No links deployed.</div>}
                                </div>

                                <button onClick={() => handleAddLink(section.id)} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #e4e4e7', background: 'white', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Plus size={14} /> DEPLOY LINK
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div >
    );
};

export default AdminSettings;
