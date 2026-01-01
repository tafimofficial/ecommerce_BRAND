import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';
import { User, Package, MapPin, LogOut, Loader2, Camera, Phone, Mail, Edit2, Plus, Trash2, RotateCcw } from 'lucide-react';
import ReturnRequestModal from '../components/ReturnRequestModal';
import AddressModal from '../components/AddressModal';

const ProfilePage = () => {
    const { user, login: updateAuthUser, logout } = useAuth();
    const { showNotification } = useNotifications();

    const [activeTab, setActiveTab] = useState('orders'); // orders, details, addresses, returns
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingReturns, setLoadingReturns] = useState(false);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '', last_name: '', phone: ''
    });

    // Modals State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || ''
            });
            fetchOrders();
            fetchAddresses();
            fetchReturns();
        }
    }, [user]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.get('orders/');
            setOrders(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchReturns = async () => {
        setLoadingReturns(true);
        try {
            const res = await api.get('returns/');
            setReturns(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch returns", error);
        } finally {
            setLoadingReturns(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await api.get('addresses/');
            setAddresses(res.data.results || res.data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch('users/me/', profileData);
            showNotification('Profile updated successfully!', 'success');
            setIsEditingProfile(false);
        } catch (error) {
            console.error(error);
            showNotification('Failed to update profile.', 'error');
        }
    };

    const openReturnModal = (order) => {
        setSelectedOrderForReturn(order);
        setShowReturnModal(true);
    };

    const openAddressModal = (address = null) => {
        setSelectedAddress(address);
        setShowAddressModal(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await api.delete(`addresses/${id}/`);
            showNotification('Address deleted.', 'success');
            fetchAddresses();
        } catch (error) {
            showNotification('Failed to delete address.', 'error');
        }
    };

    if (!user) return <div style={{ padding: '4rem', textAlign: 'center' }}>Please login to view profile.</div>;

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: isMobile ? '2rem 1rem' : '4rem 0' }}>
            <div className="container">
                <header style={{ marginBottom: '4rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'end', gap: '1rem' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', letterSpacing: '-2px', lineHeight: 1, marginBottom: '1rem' }}>
                            Hello, {user.first_name || 'Member'}.
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#71717a' }}>Manage your account and track orders.</p>
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            color: '#dc2626',
                            background: 'white',
                            border: '1px solid #fecaca',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.05)',
                            width: isMobile ? '100%' : 'auto',
                            justifyContent: 'center'
                        }}
                    >
                        <LogOut size={16} strokeWidth={2.5} />
                        <span>Sign Out</span>
                    </motion.button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '250px 1fr', gap: '4rem' }}>
                    {/* Sidebar Tabs */}
                    <div style={{
                        display: isMobile ? 'grid' : 'flex',
                        gridTemplateColumns: isMobile ? '1fr 1fr 1fr 1fr' : 'none',
                        flexDirection: isMobile ? 'none' : 'column',
                        gap: '0.5rem',
                        paddingBottom: isMobile ? '1rem' : 0
                    }}>
                        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={20} />} label={isMobile ? "Orders" : "Orders"} isMobile={isMobile} />
                        <TabButton active={activeTab === 'returns'} onClick={() => setActiveTab('returns')} icon={<RotateCcw size={20} />} label={isMobile ? "Returns" : "Returns"} isMobile={isMobile} />
                        <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<User size={20} />} label={isMobile ? "Profile" : "Profile"} isMobile={isMobile} />
                        <TabButton active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} icon={<MapPin size={20} />} label={isMobile ? "Address" : "Addresses"} isMobile={isMobile} />
                    </div>

                    {/* Content Area */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'orders' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {loadingOrders ? (
                                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>No orders found.</div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="card" style={{ padding: '2rem', background: 'white' }}>
                                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f4f4f5', paddingBottom: '1rem', gap: isMobile ? '1rem' : 0 }}>
                                                <div>
                                                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Order #{order.id}</span>
                                                    <div style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '0.25rem' }}>
                                                        Placed on {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                                                    <span style={{
                                                        background: order.status === 'Delivered' ? '#ecfdf5' : '#f4f4f5',
                                                        color: order.status === 'Delivered' ? '#059669' : '#71717a',
                                                        padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '0.5rem' }}>৳{order.total_price}</div>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} style={{ background: '#fafafa', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                                                        {item.quantity}x {item.product_name || `Product ${item.product}`}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && <span style={{ padding: '0.5rem', color: '#a1a1aa', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>+{order.items.length - 3} more</span>}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {order.status === 'Delivered' && !returns.some(r => r.order === order.id) && (
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => openReturnModal(order)}
                                                        style={{ fontSize: '0.9rem' }}
                                                    >
                                                        Request Return
                                                    </button>
                                                )}
                                                {returns.some(r => r.order === order.id) && (
                                                    <span style={{ fontSize: '0.9rem', color: '#eab308', fontWeight: 600 }}>
                                                        Return Requested
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'returns' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {loadingReturns ? (
                                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" /></div>
                                ) : returns.length === 0 ? (
                                    <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>No return requests found.</div>
                                ) : (
                                    returns.map(ret => (
                                        <div key={ret.id} className="card" style={{ padding: '2rem', background: 'white' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Return Request #{ret.id}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#71717a' }}>For Order #{ret.order}</div>
                                                </div>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: ret.status === 'Approved' ? '#dcfce7' : ret.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                                    color: ret.status === 'Approved' ? '#166534' : ret.status === 'Rejected' ? '#991b1b' : '#854d0e'
                                                }}>
                                                    {ret.status}
                                                </span>
                                            </div>

                                            <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reason</div>
                                                <p style={{ margin: 0, fontSize: '0.95rem' }}>{ret.reason}</p>
                                            </div>

                                            <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                                                Requested on {new Date(ret.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="card" style={{ padding: isMobile ? '1.5rem' : '3rem', background: 'white', maxWidth: '600px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profile Details</h2>
                                    <button
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleProfileUpdate}>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={labelStyle}>First Name</label>
                                            <input
                                                className="input-field"
                                                value={profileData.first_name}
                                                onChange={e => setProfileData({ ...profileData, first_name: e.target.value })}
                                                disabled={!isEditingProfile}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Last Name</label>
                                            <input
                                                className="input-field"
                                                value={profileData.last_name}
                                                onChange={e => setProfileData({ ...profileData, last_name: e.target.value })}
                                                disabled={!isEditingProfile}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={labelStyle}>Email Address (Read Only)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f4f4f5', borderRadius: '12px', color: '#71717a' }}>
                                            <Mail size={18} />
                                            {user.email}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={labelStyle}>Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                                            <input
                                                className="input-field"
                                                style={{ paddingLeft: '3rem' }}
                                                value={profileData.phone}
                                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                disabled={!isEditingProfile}
                                                placeholder="+880..."
                                            />
                                        </div>
                                    </div>

                                    {isEditingProfile && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '1rem' }}
                                        >
                                            Save Changes
                                        </motion.button>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Saved Addresses</h2>
                                    <button
                                        onClick={() => openAddressModal()}
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Plus size={18} /> Add New
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="card" style={{ padding: '1.5rem', background: 'white', border: addr.is_default ? '2px solid var(--primary-color)' : '1px solid #f4f4f5', position: 'relative' }}>
                                            {addr.is_default && (
                                                <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>DEFAULT</span>
                                            )}
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>{addr.street_address}</div>
                                            <p style={{ color: '#71717a', margin: '0 0 0.25rem 0' }}>{addr.city}, {addr.state} {addr.postal_code}</p>
                                            <p style={{ color: '#71717a', margin: 0, fontWeight: 500 }}>{addr.country}</p>

                                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f4f4f5' }}>
                                                <button
                                                    onClick={() => openAddressModal(addr)}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f4f4f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#a1a1aa', border: '2px dashed #e4e4e7', borderRadius: '16px' }}>
                                            <MapPin size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p>No addresses saved yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <ReturnRequestModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                order={selectedOrderForReturn}
                onSuccess={() => {
                    fetchOrders(); // Refresh status
                    fetchReturns(); // Refresh returns list to update button visibility
                }}
            />

            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                addressToEdit={selectedAddress}
                onSuccess={() => fetchAddresses()}
            />
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label, isMobile }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: isMobile ? '0.25rem' : '0.75rem',
            padding: isMobile ? '0.75rem' : '1rem 1.5rem',
            background: active ? 'white' : 'transparent',
            border: active ? '1px solid #e4e4e7' : 'none',
            borderRadius: '12px',
            color: active ? 'var(--primary-color)' : '#71717a',
            fontWeight: active ? 700 : 500,
            cursor: 'pointer',
            textAlign: isMobile ? 'center' : 'left',
            transition: 'all 0.2s',
            boxShadow: active ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
            whiteSpace: 'nowrap',
            fontSize: isMobile ? '0.8rem' : '1rem'
        }}
    >
        {icon}
        {label}
    </button>
);

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default ProfilePage;
