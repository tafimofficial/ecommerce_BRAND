import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, MoreVertical, Eye, Calendar, User, CreditCard, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '../../components/ui/Dropdown';

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState('All');

    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        api.get('orders/', { headers: { Authorization: `Token ${token}` } })
            .then(res => {
                setOrders(res.data.results || res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`orders/${id}/`, { status }, { headers: { Authorization: `Token ${token}` } });
            showNotification(`Order #${id} synchronised to ${status}.`, 'success');
            fetchOrders();
        } catch (error) {
            console.error(error);
            showNotification('Status synchronization failed.', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return { bg: '#ecfdf5', text: '#059669' };
            case 'Shipped': return { bg: '#eff6ff', text: '#2563eb' };
            case 'Processing': return { bg: '#fef3c7', text: '#d97706' };
            case 'Cancelled': return { bg: '#fef2f2', text: '#dc2626' };
            case 'Pending': return { bg: '#f4f4f5', text: '#09090b', border: '1px solid #e4e4e7' };
            default: return { bg: '#f4f4f5', text: '#71717a' };
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.id?.toString().includes(searchQuery)) ||
            (order.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.email?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div style={{ color: '#94a3b8' }}>Accessing order registry...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Orders Ledger.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Monitor and fulfill your global transactions.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ width: '180px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>FILTER BY STATUS</span>
                        <Dropdown
                            options={[{ value: 'All', label: 'All Status' }, ...statusOptions]}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            width="100%"
                        />
                    </div>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="text"
                            placeholder="Find order..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '100%', paddingLeft: '3.5rem', background: 'white' }}
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="card desktop-table-view" style={{ padding: 0.5, background: 'white', overflow: 'hidden', border: '1px solid #f4f4f5' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Entity</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financials</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orchestration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const statusStyle = getStatusColor(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f4f4f5', transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>#{order.id}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#f4f4f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.full_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{order.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <CreditCard size={14} color="#a1a1aa" />
                                                <strong style={{ fontSize: '1.1rem' }}>৳{order.total_price}</strong>
                                            </div>
                                            {(parseFloat(order.shipping_price) > 0 || parseFloat(order.discount_amount) > 0) && (
                                                <div style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                                                    {parseFloat(order.shipping_price) > 0 && <span style={{ background: '#f4f4f5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>SHIP: +৳{order.shipping_price}</span>}
                                                    {parseFloat(order.discount_amount) > 0 && <span style={{ color: '#10b981', background: '#ecfdf5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>OFF: -৳{order.discount_amount}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '50px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: statusStyle.border || 'none',
                                                letterSpacing: '0.02em'
                                            }}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#71717a', fontSize: '0.9rem' }}>
                                                <Calendar size={14} />
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 1, 1970'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '8px', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <Dropdown
                                                    options={statusOptions}
                                                    value={order.status}
                                                    onChange={(val) => updateStatus(order.id, val)}
                                                    width="140px"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#a1a1aa' }}>
                        No records found matching your search parameters.
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="mobile-card-view" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.map(order => {
                    const statusStyle = getStatusColor(order.status);
                    return (
                        <div key={order.id} className="card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f4f4f5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f4f4f5', paddingBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>#{order.id}</span>
                                <span style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#f4f4f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{order.full_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{order.email}</div>
                                </div>
                            </div>

                            <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: 600 }}>Total Amount</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)' }}>৳{order.total_price}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: statusStyle.bg,
                                    color: statusStyle.text,
                                    border: statusStyle.border || 'none'
                                }}>
                                    {order.status.toUpperCase()}
                                </span>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <Dropdown
                                        options={statusOptions}
                                        value={order.status}
                                        onChange={(val) => updateStatus(order.id, val)}
                                        width="140px"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                        No orders found.
                    </div>
                )}
            </div>
            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', pading: '1rem'
                        }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card"
                            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'white', padding: '2rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order #{selectedOrder.id} Items</h2>
                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent' }}><X size={24} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.product_name || `Product ${item.product}`}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>Product ID: {item.product}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '0.25rem' }}>
                                                    {item.size && <span style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Size: {item.size}</span>}
                                                    {item.color && <span style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Color: {item.color}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>x{item.quantity}</div>
                                            <div style={{ fontSize: '0.9rem' }}>৳{item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '1px solid #f4f4f5', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Total: ৳{selectedOrder.total_price}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminOrderList;
