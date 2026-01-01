import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';
import { Search, Image, CheckCircle, XCircle, Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const AdminReturnRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotifications();
    const [selectedImage, setSelectedImage] = useState(null);
    const { settings, refreshSettings } = useSettings();
    const { token } = useAuth();
    const [returnDays, setReturnDays] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (settings && settings.return_window_days !== undefined) {
            setReturnDays(settings.return_window_days);
        }
    }, [settings]);

    const fetchRequests = async () => {
        try {
            const res = await api.get('returns/');
            const data = res.data.results || res.data;
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch return requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.patch('site-settings/1/', { return_window_days: returnDays }, {
                headers: { Authorization: `Token ${token}` }
            });
            showNotification('Return policy updated successfully.', 'success');
            refreshSettings();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update return policy.', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`returns/${id}/`, { status }, { headers: { Authorization: `Token ${token}` } });
            showNotification(`Request ${status.toLowerCase()} successfully.`, 'success');
            fetchRequests();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update status.', 'error');
        }
    };

    const [selectedStatus, setSelectedStatus] = useState('All');

    // ... existing functions ...

    const filteredRequests = requests.filter(req =>
        selectedStatus === 'All' || req.status === selectedStatus
    );

    if (loading) return <div style={{ padding: '2rem' }}>Loading requests...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Return Requests.</h1>
                    <p style={{ color: '#71717a' }}>Manage customer return applications.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <label style={{ marginRight: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#71717a', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>FILTER STATUS</span>
                        <select
                            className="input-field"
                            style={{ marginBottom: 0, height: '40px', padding: '0 1rem' }}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="All">All Requests</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </label>

                    <form onSubmit={handleUpdateSettings} style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f4f4f5' }}>
                        <label>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#71717a', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Allowed Return Days</span>
                            <input
                                type="number"
                                className="input-field"
                                style={{ marginBottom: 0, width: '100px', padding: '0.5rem', fontSize: '0.9rem' }}
                                value={returnDays}
                                onChange={(e) => setReturnDays(e.target.value)}
                            />
                        </label>
                        <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ height: '38px', padding: '0 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                            {savingSettings ? 'SAVING...' : <><Save size={14} style={{ marginRight: '0.4rem' }} /> SAVE POLICY</>}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card" style={{ padding: '0', background: 'white', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>REQUEST ID</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ORDER</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>REASON</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>PROOF</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>STATUS</th>
                            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => (
                            <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>#{req.id}</td>
                                <td style={{ padding: '1rem' }}>Order #{req.order}</td>
                                <td style={{ padding: '1rem', maxWidth: '300px' }}>{req.reason}</td>
                                <td style={{ padding: '1rem' }}>
                                    {req.image ? (
                                        <button
                                            onClick={() => setSelectedImage(req.image)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            <Image size={16} /> View
                                        </button>
                                    ) : <span style={{ color: '#cbd5e1' }}>No Image</span>}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                                        background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                        color: req.status === 'Approved' ? '#166534' : req.status === 'Rejected' ? '#991b1b' : '#854d0e'
                                    }}>
                                        {req.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {req.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => updateStatus(req.id, 'Approved')}
                                                style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(req.id, 'Rejected')}
                                                style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No return requests found.</div>}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <img src={selectedImage} alt="Return Proof" style={{ maxWidth: '90%', maxHeight: '90vh', borderRadius: '12px' }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminReturnRequests;
