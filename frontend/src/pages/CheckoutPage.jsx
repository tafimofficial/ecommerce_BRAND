import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, ArrowLeft, Tag, XCircle, CheckCircle2, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useSettings } from '../context/SettingsContext';

const CheckoutPage = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    // Shipping Locations
    const [availableLocations, setAvailableLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [formData, setFormData] = useState({
        full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
        email: user ? user.email : '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    useEffect(() => {
        fetchShippingLocations();
    }, []);

    const fetchShippingLocations = async () => {
        try {
            const res = await api.get('shipping-locations/');
            setAvailableLocations(res.data);
        } catch (error) {
            console.error('Failed to fetch shipping nodes', error);
        }
    };

    // UseEffect to fetch user addresses and pre-fill form
    useEffect(() => {
        if (user) {
            const fetchAddresses = async () => {
                try {
                    const res = await api.get('addresses/');
                    const addresses = res.data;
                    if (addresses.length > 0) {
                        // Find default or use first
                        const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
                        setFormData(prev => ({
                            ...prev,
                            address_line_1: defaultAddr.street_address,
                            city: defaultAddr.city,
                            state: defaultAddr.state,
                            postal_code: defaultAddr.postal_code,
                            country: defaultAddr.country
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch addresses", error);
                }
            };
            fetchAddresses();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplying(true);
        setCouponError('');
        try {
            const res = await api.post('coupons/apply/', {
                code: couponCode.toUpperCase(),
                amount: getCartTotal()
            });
            setAppliedCoupon(res.data);
            setCouponCode('');
        } catch (error) {
            setCouponError(error.response?.data?.error || 'Invalid coupon');
            setAppliedCoupon(null);
        } finally {
            setIsApplying(false);
        }
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discount_type === 'FLAT') {
            return parseFloat(appliedCoupon.discount_value);
        } else {
            return (getCartTotal() * parseFloat(appliedCoupon.discount_value)) / 100;
        }
    };

    // Use selected location charge, or fallback to global delivery charge
    const deliveryCharge = selectedLocation
        ? parseFloat(selectedLocation.charge)
        : parseFloat(settings.delivery_charge || 0);

    const discount = calculateDiscount();
    const total = getCartTotal() + deliveryCharge - discount;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderData = {
            ...formData,
            items: cart.map(item => ({
                product_slug: item.slug,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color
            })),
            coupon_code: appliedCoupon?.code,
            discount_amount: discount,
            shipping_price: deliveryCharge,
            total_price: total
        };

        try {
            const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
            const response = await api.post('orders/', orderData, config);
            clearCart();
            navigate(`/payment/${response.data.id}`);
        } catch (error) {
            console.error('Order failed', error);
            alert('Failed to place order. Please try again.');
        }
    };

    if (cart.length === 0) return (
        <div className="container" style={{ padding: '10rem 1.5rem', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.3 }}>YOUR INVENTORY IS EMPTY.</h2>
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '4rem 0' }}>
            <div className="container">
                <header style={{ marginBottom: '4rem' }}>
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ fontSize: '5rem', letterSpacing: '-4px', lineHeight: 1 }}
                    >
                        Checkout.
                    </motion.h1>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '5rem', alignItems: 'start' }}>
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form id="checkout-form" onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Recipient Details</h3>
                                {!user && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-100)' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                            Guest Checkout. <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>LOGIN</a> for faster order tracking.
                                        </p>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <input className="input-field" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
                                    <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input className="input-field" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                                        <input className="input-field" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Logistics Selection</h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    {availableLocations.map(loc => (
                                        <div
                                            key={loc.id}
                                            onClick={() => setSelectedLocation(loc)}
                                            style={{
                                                padding: '1.5rem',
                                                border: selectedLocation?.id === loc.id ? '2px solid var(--primary-color)' : '1px solid var(--gray-100)',
                                                background: selectedLocation?.id === loc.id ? 'var(--gray-50)' : 'white',
                                                borderRadius: '16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{loc.name}</span>
                                                {selectedLocation?.id === loc.id && <CheckCircle2 size={16} color="var(--primary-color)" />}
                                            </div>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>৳{loc.charge}</span>
                                        </div>
                                    ))}
                                    {/* Optional fallback/global option if no locations exist or to allow "General" selection */}
                                    {availableLocations.length === 0 && (
                                        <div style={{ padding: '1.5rem', border: '1px solid var(--gray-100)', borderRadius: '16px', background: 'var(--gray-50)', opacity: 0.5 }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>Standard global shipping applied.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Shipping Destination</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <input className="input-field" name="address_line_1" placeholder="Address Line 1" value={formData.address_line_1} onChange={handleChange} required />
                                    <input className="input-field" name="address_line_2" placeholder="Suite, Apartment, etc. (Optional)" value={formData.address_line_2} onChange={handleChange} />
                                    <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input className="input-field" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                                        <input className="input-field" name="state" placeholder="State/Province" value={formData.state} onChange={handleChange} required />
                                    </div>
                                    <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input className="input-field" name="postal_code" placeholder="Postal / ZIP" value={formData.postal_code} onChange={handleChange} required />
                                        <input className="input-field" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>


                        </form>
                    </motion.div>

                    {/* Summary Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ position: 'sticky', top: '100px' }}
                    >
                        <div className="card" style={{ padding: '3rem', border: '1px solid var(--gray-100)', background: 'white' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '2.5rem', letterSpacing: '-2px' }}>Order Evaluation.</h3>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '1rem' }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                        <span style={{ fontWeight: 500 }}>{item.quantity} x {item.name}</span>
                                        <span style={{ fontWeight: 700 }}>৳{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '2px solid var(--gray-50)', paddingTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span>৳{getCartTotal().toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                    <span>Shipping</span>
                                    <span>{deliveryCharge > 0 ? `৳${deliveryCharge.toFixed(2)}` : 'COMPLIMENTARY'}</span>
                                </div>
                                {appliedCoupon && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#10b981', fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Tag size={16} />
                                            <span>Coupon ({appliedCoupon.code})</span>
                                        </div>
                                        <span>-৳{discount.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Coupon Input */}
                                <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            className="input-field"
                                            placeholder="Promo Code"
                                            style={{ marginBottom: 0, textTransform: 'uppercase' }}
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ padding: '0 1.5rem', borderRadius: '50px' }}
                                            onClick={applyCoupon}
                                            disabled={isApplying}
                                        >
                                            APPLY
                                        </button>
                                    </div>
                                    {couponError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>{couponError}</p>}
                                    {appliedCoupon && !couponError && <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>Coupon applied successfully!</p>}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--primary-color)' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 500 }}>Total Due</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>৳{Math.max(0, total).toFixed(2)}</span>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    form="checkout-form"
                                    className="btn btn-primary"
                                    disabled={availableLocations.length > 0 && !selectedLocation}
                                    style={{
                                        width: '100%',
                                        padding: '1.5rem',
                                        fontSize: '1.2rem',
                                        marginTop: '2rem',
                                        opacity: (availableLocations.length > 0 && !selectedLocation) ? 0.5 : 1,
                                        cursor: (availableLocations.length > 0 && !selectedLocation) ? 'not-allowed' : 'pointer',
                                        borderRadius: '16px'
                                    }}
                                >
                                    <CreditCard size={20} style={{ marginRight: '12px' }} />
                                    {(availableLocations.length > 0 && !selectedLocation) ? 'SELECT LOGISTICS NODE' : 'CONFIRM & PAY'}
                                </motion.button>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                                <ShoppingBag size={20} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>100% SECURE TRANSACTION</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div >
        </div >
    );
};

export default CheckoutPage;
