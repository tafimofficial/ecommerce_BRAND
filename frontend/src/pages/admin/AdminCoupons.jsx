import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Tag, Calendar, ShoppingBag, ShieldCheck, ShieldAlert, Percent, CreditCard, ChevronRight, X, Zap, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '../../components/ui/Dropdown';

const AdminCoupons = () => {
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm } = useModal();
    const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' or 'rules'

    // Coupons State
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'FLAT',
        discount_value: '',
        min_purchase: '0.00',
        expiry_date: '',
        is_active: true
    });

    // Rules State
    const [rules, setRules] = useState([]);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [ruleData, setRuleData] = useState({
        name: '',
        trigger_event: 'LOGIN',
        min_amount: '0.00',
        coupon: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        if (activeTab === 'coupons') fetchCoupons();
        else fetchRules();
    }, [activeTab]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get('coupons/');
            setCoupons(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await api.get('coupon-rules/');
            setRules(res.data.results || res.data);

            // Also fetch coupons for the dropdown if needed, or rely on existing coupons state if previously fetched
            if (coupons.length === 0) {
                const resCoupons = await api.get('coupons/');
                setCoupons(resCoupons.data.results || resCoupons.data);
            }
        } catch (error) {
            console.error("Failed to fetch rules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('coupons/', formData);
            setShowForm(false);
            setFormData({
                code: '', discount_type: 'FLAT', discount_value: '',
                min_purchase: '0.00', expiry_date: '', is_active: true
            });
            fetchCoupons();
        } catch (error) {
            console.error("Failed to save coupon", error);
            showNotification('Integrity check failed. Check code uniqueness.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm("Terminate Campaign", "Eradicate this discount identifier from the registry?", "Terminate");
        if (!ok) return;
        try {
            await api.delete(`coupons/${id}/`);
            fetchCoupons();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const toggleStatus = async (coupon) => {
        try {
            await api.patch(`coupons/${coupon.id}/`, { is_active: !coupon.is_active });
            fetchCoupons();
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    // Rule Handlers
    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('coupon-rules/', ruleData);
            setShowRuleForm(false);
            setRuleData({
                name: '', trigger_event: 'LOGIN', min_amount: '0.00',
                coupon: '', start_date: '', end_date: '', is_active: true
            });
            fetchRules();
            showNotification('Automation rule activated successfully.', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Failed to create rule.', 'error');
        }
    };

    const handleDeleteRule = async (id) => {
        const ok = await confirm("Delete Rule", "Are you sure you want to remove this automation?", "Delete");
        if (!ok) return;
        try {
            await api.delete(`coupon-rules/${id}/`);
            fetchRules();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleRuleStatus = async (rule) => {
        try {
            await api.patch(`coupon-rules/${rule.id}/`, { is_active: !rule.is_active });
            fetchRules();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Discount Registry.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Architect promotional identifiers and automation rules.</p>
                </div>

                <div className="mobile-actions-stack" style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: '#f4f4f5', padding: '0.3rem', borderRadius: '12px', display: 'flex' }}>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            style={{
                                padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                                background: activeTab === 'coupons' ? 'white' : 'transparent',
                                color: activeTab === 'coupons' ? 'black' : '#71717a',
                                boxShadow: activeTab === 'coupons' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Coupons
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            style={{
                                padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                                background: activeTab === 'rules' ? 'white' : 'transparent',
                                color: activeTab === 'rules' ? 'black' : '#71717a',
                                boxShadow: activeTab === 'rules' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Automation Rules
                        </button>
                    </div>

                    <button
                        onClick={() => activeTab === 'coupons' ? setShowForm(!showForm) : setShowRuleForm(!showRuleForm)}
                        className="btn btn-primary"
                        style={{ padding: '0.9rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                        {activeTab === 'coupons' ? (showForm ? <X size={20} /> : <Plus size={20} />) : (showRuleForm ? <X size={20} /> : <Zap size={20} />)}
                        {activeTab === 'coupons' ? (showForm ? 'CANCEL' : 'CREATE COUPON') : (showRuleForm ? 'CANCEL' : 'NEW RULE')}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {activeTab === 'rules' && showRuleForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card"
                        style={{ padding: '3rem', marginBottom: '3rem', background: '#fff', border: '1px solid #f4f4f5' }}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={24} color="#f59e0b" /> New Automation Rule
                        </h3>
                        <form onSubmit={handleRuleSubmit} className="rule-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>RULE NAME</span>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Summer Login Bonus"
                                    value={ruleData.name}
                                    onChange={e => setRuleData({ ...ruleData, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>TRIGGER EVENT</span>
                                <Dropdown
                                    options={[
                                        { value: 'LOGIN', label: 'On User Login' },
                                        { value: 'ORDER_OVER_AMOUNT', label: 'Order Value Exceeds' }
                                    ]}
                                    value={ruleData.trigger_event}
                                    onChange={(val) => setRuleData({ ...ruleData, trigger_event: val })}
                                    width="100%"
                                />
                            </label>
                            {ruleData.trigger_event === 'ORDER_OVER_AMOUNT' && (
                                <label>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>MIN AMOUNT (৳)</span>
                                    <input
                                        type="number" className="input-field"
                                        value={ruleData.min_amount}
                                        onChange={e => setRuleData({ ...ruleData, min_amount: e.target.value })}
                                        required
                                    />
                                </label>
                            )}
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>COUPON TO SEND</span>
                                <Dropdown
                                    options={coupons.map(c => ({
                                        value: c.id,
                                        label: `${c.code} - ${c.discount_type === 'FLAT' ? `৳${c.discount_value}` : `${c.discount_value}%`}`
                                    }))}
                                    value={ruleData.coupon}
                                    onChange={(val) => setRuleData({ ...ruleData, coupon: val })}
                                    width="100%"
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>START DATE</span>
                                <input
                                    type="datetime-local" className="input-field"
                                    value={ruleData.start_date}
                                    onChange={e => setRuleData({ ...ruleData, start_date: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>END DATE</span>
                                <input
                                    type="datetime-local" className="input-field"
                                    value={ruleData.end_date}
                                    onChange={e => setRuleData({ ...ruleData, end_date: e.target.value })}
                                    required
                                />
                            </label>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem 5rem', borderRadius: '16px' }}>CREATE RULE</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeTab === 'coupons' && showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card"
                        style={{ padding: '3rem', marginBottom: '3rem', background: '#fff', border: '1px solid #f4f4f5' }}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Campaign Specifications</h3>
                        <form onSubmit={handleSubmit} className="rule-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>IDENTIFIER CODE</span>
                                <input
                                    className="input-field"
                                    style={{ textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px' }}
                                    placeholder="e.g. ALPHA2024"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>INCENTIVE TYPE</span>
                                <Dropdown
                                    options={[
                                        { value: 'FLAT', label: 'Currency Subtraction (৳)' },
                                        { value: 'PERCENTAGE', label: 'Ratio Deduction (%)' }
                                    ]}
                                    value={formData.discount_type}
                                    onChange={(val) => setFormData({ ...formData, discount_type: val })}
                                    width="100%"
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}> VALUE</span>
                                <input
                                    type="number" className="input-field"
                                    value={formData.discount_value}
                                    onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>THRESHOLD (MIN PURCHASE ৳)</span>
                                <input
                                    type="number" className="input-field"
                                    value={formData.min_purchase}
                                    onChange={e => setFormData({ ...formData, min_purchase: e.target.value })}
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>EXPIRY DATE</span>
                                <input
                                    type="datetime-local" className="input-field"
                                    value={formData.expiry_date}
                                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    required
                                />
                            </label>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem 5rem', borderRadius: '16px' }}>CREATE CUPON</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}>Synchronizing...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {activeTab === 'coupons' && (
                        coupons.length > 0 ? coupons.map(coupon => (
                            <motion.div
                                layout
                                key={coupon.id}
                                className="card"
                                style={{
                                    padding: '2rem',
                                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                    background: 'white', border: '1px solid #f4f4f5',
                                    opacity: coupon.is_active ? 1 : 0.6,
                                    filter: coupon.is_active ? 'none' : 'grayscale(1)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ background: '#09090b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '1px' }}>
                                        {coupon.code}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => toggleStatus(coupon)} title={coupon.is_active ? "Suspend" : "Activate"} style={{ width: '40px', height: '40px', background: '#f4f4f5', border: 'none', borderRadius: '10px', cursor: 'pointer', color: coupon.is_active ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {coupon.is_active ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id)} style={{ width: '40px', height: '40px', background: '#fef2f2', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', border: '1px solid #f4f4f5' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#a1a1aa', marginBottom: '0.5rem' }}>DEDUCTION</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#09090b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {coupon.discount_type === 'FLAT' ? <Tag size={18} color="#10b981" /> : <Percent size={18} color="#3b82f6" />}
                                            {coupon.discount_type === 'FLAT' ? `৳${coupon.discount_value}` : `${coupon.discount_value}%`}
                                        </div>
                                    </div>
                                    <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', border: '1px solid #f4f4f5' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#a1a1aa', marginBottom: '0.5rem' }}>THRESHOLD</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#09090b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CreditCard size={18} color="#71717a" />
                                            ৳{coupon.min_purchase}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#71717a', borderTop: '1px solid #f4f4f5', paddingTop: '1rem' }}>
                                    <Calendar size={16} />
                                    <span style={{ fontWeight: 600 }}>Expires: {new Date(coupon.expiry_date).toLocaleString()}</span>
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #e4e4e7' }}>
                                <Tag size={64} style={{ color: '#e4e4e7', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', marginBottom: '0.5rem' }}>Vacuum State.</h3>
                                <p style={{ color: '#71717a' }}>No promotional identifiers exist in the current registry.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'rules' && (
                        // RULES RENDER
                        rules.length > 0 ? rules.map(rule => (
                            <motion.div
                                layout
                                key={rule.id}
                                className="card"
                                style={{
                                    padding: '2rem',
                                    display: 'flex', flexDirection: 'column', gap: '1.5rem',
                                    background: 'white', border: '1px solid #f4f4f5',
                                    opacity: rule.is_active ? 1 : 0.6,
                                    filter: rule.is_active ? 'none' : 'grayscale(1)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{rule.name}</div>
                                        <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                            {rule.trigger_event === 'LOGIN' ? 'ON LOGIN' : `ORDER > ৳${rule.min_amount}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => toggleRuleStatus(rule)} style={{ width: '40px', height: '40px', background: '#f4f4f5', border: 'none', borderRadius: '10px', cursor: 'pointer', color: rule.is_active ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {rule.is_active ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                        </button>
                                        <button onClick={() => handleDeleteRule(rule.id)} style={{ width: '40px', height: '40px', background: '#fef2f2', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                    <ArrowRight size={16} color="#166534" />
                                    <span style={{ color: '#166534', fontWeight: 700 }}>Sends Coupon: {rule.coupon_code}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#71717a' }}>
                                    Active: {new Date(rule.start_date).toLocaleDateString()} - {new Date(rule.end_date).toLocaleDateString()}
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #e4e4e7' }}>
                                <Zap size={64} style={{ color: '#e4e4e7', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09090b', marginBottom: '0.5rem' }}>No Active Rules.</h3>
                                <p style={{ color: '#71717a' }}>Create automation rules to reward your customers.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default AdminCoupons;
