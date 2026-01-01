import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Search, ChevronDown, UserCircle2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { settings } = useSettings();
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    useEffect(() => {
        api.get('categories/').then(res => setCategories(res.data.results || res.data)).catch(console.error);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setMobileSearchOpen(false);
        }
    };

    if (location.pathname.startsWith('/admin-panel')) return null;

    return (
        <>
            <nav style={{
                background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'var(--white)',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--gray-200)' : 'none',
                position: 'sticky',
                top: 0,
                zIndex: 9999,
                transition: 'all 0.4s ease'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '80px',
                    padding: '0 1rem'
                }}>
                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(true)}
                        style={{
                            background: 'transparent',
                            padding: '0.5rem',
                            marginLeft: '-0.5rem',
                            color: 'var(--primary-color)'
                        }}
                    >
                        <Menu size={28} />
                    </button>

                    {/* Logo */}
                    <Link to="/" style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        letterSpacing: '-2px',
                        color: 'var(--primary-color)',
                        textDecoration: 'none'
                    }}>
                        {settings.brand_name?.substring(0, 10)}<span style={{ color: 'var(--accent-color)' }}>.</span>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="desktop-search" style={{ flex: '0 0 35%', display: 'flex', position: 'relative' }}>
                        <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Explore collections..."
                                className="input-field"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    marginBottom: 0,
                                    paddingLeft: '3rem',
                                    background: scrolled ? 'var(--gray-100)' : 'var(--gray-50)',
                                    border: '1px solid transparent'
                                }}
                            />
                            <Search
                                size={18}
                                style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            />
                        </form>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="desktop-links" style={{ display: 'flex', gap: '2rem' }}>
                            <Link to="/shop" style={{ fontWeight: '700', fontSize: '1.1rem' }}>Collection</Link>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {/* Mobile Search Icon */}
                            <button
                                className="mobile-search-btn"
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                style={{ background: 'transparent', color: 'var(--primary-color)' }}
                            >
                                <Search size={24} />
                            </button>

                            <Link to="/cart" style={{ position: 'relative' }}>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <ShoppingCart size={24} color="var(--primary-color)" />
                                    {cartCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -8, right: -8,
                                            background: 'var(--primary-color)', color: 'var(--accent-color)',
                                            borderRadius: '50%', width: '18px', height: '18px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', fontWeight: 'bold'
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>

                            {user ? (
                                <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Link to="/profile" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', borderRadius: '50px', border: 'none', background: '#f4f4f5', color: '#18181b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <UserCircle2 size={18} />
                                        Profile
                                    </Link>
                                    <motion.button
                                        onClick={logout}
                                        className="btn btn-outline"
                                        style={{ padding: '0.6rem 1.2rem', borderRadius: '50px' }}
                                        whileHover={{ backgroundColor: '#000', color: '#fff' }}
                                    >
                                        Log out
                                    </motion.button>
                                </div>
                            ) : (
                                <Link to="/login" className="desktop-auth btn btn-primary">
                                    Join Now
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Dropdown */}
                <AnimatePresence>
                    {mobileSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ background: 'white', overflow: 'hidden', borderBottom: '1px solid var(--gray-200)' }}
                        >
                            <form onSubmit={handleSearch} style={{ padding: '1rem', position: 'relative' }} className="container">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field"
                                    style={{
                                        marginBottom: 0,
                                        paddingLeft: '3rem',
                                        borderRadius: '12px',
                                        background: 'var(--gray-50)',
                                        border: 'none'
                                    }}
                                />
                                <Search
                                    size={18}
                                    style={{ position: 'absolute', left: '2.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                />
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Horizontal Divider for Subcategories */}
                <div className="desktop-categories" style={{
                    borderTop: scrolled ? 'none' : '1px solid var(--gray-100)',
                    padding: scrolled ? '0' : '0.75rem 0',
                    transition: 'all 0.3s'
                }}>
                    <AnimatePresence>
                        {!scrolled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="container"
                                style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}
                            >
                                {/* If we are on a specific category, show its subcategories, otherwise show categories */}
                                {(() => {
                                    const searchParams = new URLSearchParams(location.search);
                                    const categorySlug = searchParams.get('category');
                                    const activeCat = categories.find(c => c.slug === categorySlug);

                                    if (activeCat && activeCat.subcategories?.length > 0) {
                                        return (
                                            <>
                                                <Link to="/shop" style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    ALL COLLECTIONS
                                                </Link>
                                                <span style={{ color: 'var(--gray-300)' }}>|</span>
                                                {activeCat.subcategories.map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        to={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}`}
                                                        style={{
                                                            fontWeight: '600',
                                                            color: searchParams.get('subcategory') === sub.slug ? 'var(--primary-color)' : 'var(--text-muted)',
                                                            fontSize: '0.9rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em'
                                                        }}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </>
                                        );
                                    }

                                    return categories.map(cat => (
                                        <div key={cat.id} style={{ position: 'relative' }} className="nav-item-category">
                                            <Link
                                                to={`/shop?category=${cat.slug}`}
                                                style={{
                                                    fontWeight: '600',
                                                    color: categorySlug === cat.slug ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    fontSize: '0.9rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem'
                                                }}
                                            >
                                                {cat.name}
                                                {cat.subcategories?.length > 0 && <ChevronDown size={14} />}
                                            </Link>

                                            {/* Subcategory Dropdown on Hover */}
                                            {cat.subcategories?.length > 0 && (
                                                <div className="subcategory-dropdown" style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: 'white',
                                                    boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                                                    borderRadius: '16px',
                                                    padding: '1.25rem',
                                                    minWidth: '220px',
                                                    display: 'none',
                                                    zIndex: 1000,
                                                    border: '1px solid var(--gray-100)',
                                                    paddingTop: '2rem' /* Interaction bridge */
                                                }}>
                                                    <div style={{ display: 'grid', gap: '0.4rem', background: 'white', borderRadius: '12px' }}>
                                                        {cat.subcategories.map(sub => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                                                style={{
                                                                    color: 'var(--text-color)',
                                                                    fontSize: '0.85rem',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '8px',
                                                                    fontWeight: 500
                                                                }}
                                                                className="sub-link-hover"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav >

            {/* Mobile Sidebar (Drawer) */}
            < AnimatePresence >
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, backdropFilter: 'blur(2px)'
                            }}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, bottom: 0,
                                width: '85%', maxWidth: '320px',
                                background: 'white',
                                zIndex: 10001,
                                padding: '2rem',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Menu.</h2>
                                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Mobile Search */}
                            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} style={{ position: 'relative', marginBottom: '2rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search store..."
                                    className="input-field"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        paddingLeft: '3rem',
                                        background: 'var(--gray-50)',
                                        border: '1px solid var(--gray-200)'
                                    }}
                                />
                                <Search
                                    size={18}
                                    style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                />
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700 }}>Home</Link>
                                <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700 }}>Shop Collection</Link>
                                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                                    Cart
                                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{cartCount} items</span>
                                </Link>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '0.5rem 0' }} />

                                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>CATEGORIES</p>
                                {categories.map(cat => (
                                    <div key={cat.id}>
                                        {cat.subcategories && cat.subcategories.length > 0 ? (
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <div
                                                    onClick={() => toggleCategory(cat.id)}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        fontSize: '1rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        paddingRight: '0.5rem'
                                                    }}
                                                >
                                                    {cat.name}
                                                    <motion.div
                                                        animate={{ rotate: expandedCategories[cat.id] ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ChevronDown size={16} />
                                                    </motion.div>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedCategories[cat.id] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            style={{ overflow: 'hidden' }}
                                                        >
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', marginTop: '0.5rem', borderLeft: '2px solid var(--gray-100)' }}>
                                                                <Link
                                                                    to={`/shop?category=${cat.slug}`}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}
                                                                >
                                                                    View all {cat.name}
                                                                </Link>
                                                                {cat.subcategories.map(sub => (
                                                                    <Link
                                                                        key={sub.id}
                                                                        to={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                        style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <Link
                                                to={`/shop?category=${cat.slug}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{ display: 'block', fontSize: '1rem', marginBottom: '0.75rem', fontWeight: 500 }}
                                            >
                                                {cat.name}
                                            </Link>
                                        )}
                                    </div>
                                ))}

                                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '0.5rem 0' }} />

                                {user ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}
                                        >
                                            My Profile
                                        </Link>
                                        {user.is_staff && (
                                            <Link
                                                to="/admin-panel/dashboard"
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-color)' }}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            style={{ textAlign: 'left', fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', background: 'transparent' }}
                                        >
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>Login / Join</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence >
        </>
    );
};

export default Navbar;
