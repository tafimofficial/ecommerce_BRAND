import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Truck, Save, RefreshCcw, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDelivery = () => {
    const { settings, refreshSettings, loading: contextLoading } = useSettings();
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm } = useModal();
    const [deliveryCharge, setDeliveryCharge] = useState(settings.delivery_charge || 0);
    const [saving, setSaving] = useState(false);

    // Location Management State
    const [locations, setLocations] = useState([]);
    const [locLoading, setLocLoading] = useState(true);
    const [editingLoc, setEditingLoc] = useState(null);
    const [locForm, setLocForm] = useState({ name: '', charge: '' });

    useEffect(() => {
        if (!contextLoading) {
            setDeliveryCharge(settings.delivery_charge || 0);
        }
        fetchLocations();
    }, [settings, contextLoading]);

    const fetchLocations = async () => {
        try {
            const res = await api.get('shipping-locations/');
            setLocations(res.data);
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLocLoading(false);
        }
    };

    const handleSaveGlobalCharge = async () => {
        setSaving(true);
        try {
            await api.put('site-settings/1/', {
                ...settings,
                delivery_charge: deliveryCharge
            }, { headers: { Authorization: `Token ${token}` } });
            showNotification('Logistics fee synchronized successfully.', 'success');
            refreshSettings();
        } catch (error) {
            console.error('Update failed', error);
            showNotification('Failed to synchronize logistics fee.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLocSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingLoc) {
                await api.patch(`shipping-locations/${editingLoc.id}/`, locForm);
                showNotification('Regional logistics updated.', 'info');
            } else {
                await api.post('shipping-locations/', locForm);
                showNotification('New logistics node established.', 'success');
            }
            setLocForm({ name: '', charge: '' });
            setEditingLoc(null);
            fetchLocations();
        } catch (error) {
            showNotification('Failed to commit regional logistics.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLocDelete = async (id) => {
        const ok = await confirm("Confirm Termination", "Terminate this regional logistics node? This action is irreversible.", "Terminate");
        if (!ok) return;
        try {
            await api.delete(`shipping-locations/${id}/`);
            showNotification('Logistics node purged.', 'info');
            fetchLocations();
        } catch (error) {
            showNotification('Purge failure.', 'error');
        }
    };

    if (contextLoading) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.3 }}>CURATING LOGISTICS...</h2>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px', margin: 0 }}>Logistics Hub.</h1>
                <p style={{ color: '#71717a', fontSize: '1.2rem', marginTop: '0.5rem' }}>Architect regional and global delivery parameters.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                {/* Global Settings */}
                <div className="card" style={{ padding: '3rem', background: 'white', border: '1px solid #f4f4f5' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>Orchestration Protocol.</h3>
                        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Define universal fallback delivery metrics.</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#71717a', marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase' }}>
                                GLOBAL FALLBACK FEE (৳)
                            </span>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900 }}>৳</div>
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ paddingLeft: '3.5rem', fontSize: '1.25rem', fontWeight: 800, marginBottom: 0 }}
                                    value={deliveryCharge}
                                    onChange={(e) => setDeliveryCharge(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveGlobalCharge}
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                    >
                        {saving ? 'SYNCHRONIZING...' : <><Save size={18} /> COMMIT GLOBAL FEE</>}
                    </motion.button>
                </div>

                {/* Regional Management */}
                <div className="card" style={{ padding: '3rem', background: 'white', border: '1px solid #f4f4f5' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>Regional Node Repository.</h3>
                        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Define specific logistics fees per geolocation.</p>
                    </div>

                    <form onSubmit={handleLocSubmit} style={{ marginBottom: '3rem', background: '#fafafa', padding: '2rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                className="input-field"
                                placeholder="Region (e.g., Inside Dhaka)"
                                style={{ marginBottom: 0, flex: '1 1 200px' }}
                                value={locForm.name}
                                onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                                required
                            />
                            <input
                                className="input-field"
                                type="number"
                                placeholder="৳"
                                style={{ marginBottom: 0, flex: '1 1 80px' }}
                                value={locForm.charge}
                                onChange={(e) => setLocForm({ ...locForm, charge: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {editingLoc ? <><RefreshCcw size={16} /> REVISE NODE</> : <><Plus size={16} /> ESTABLISH NODE</>}
                        </button>
                        {editingLoc && (
                            <button
                                type="button"
                                onClick={() => { setEditingLoc(null); setLocForm({ name: '', charge: '' }); }}
                                style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: 'none', color: '#71717a', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                CANCEL REVISION
                            </button>
                        )}
                    </form>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {locLoading ? <p style={{ textAlign: 'center', opacity: 0.5 }}>FETCHING NODES...</p> : locations.map(loc => (
                            <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #f4f4f5', borderRadius: '12px', background: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{loc.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600 }}>LOGISTICS FEE: ৳{loc.charge}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => { setEditingLoc(loc); setLocForm({ name: loc.name, charge: loc.charge }); }} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#f4f4f5', color: '#09090b', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                    <button onClick={() => handleLocDelete(loc.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDelivery;
