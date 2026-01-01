import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (user && !user.is_staff) {
            navigate('/');
        } else if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user || !user.is_staff) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f9', position: 'relative' }}>

            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="admin-main-content" style={{
                flex: 1,
                marginLeft: '280px',
                display: 'flex',
                flexDirection: 'column',
                width: 'calc(100% - 280px)',
                transition: 'margin-left 0.3s ease, width 0.3s ease'
            }}>
                <header style={{
                    height: '80px',
                    background: 'white',
                    borderBottom: '1px solid #e4e4e7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 90
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="mobile-menu-btn"
                            style={{
                                display: 'none',
                                background: 'transparent',
                                padding: '0.5rem',
                                marginLeft: '-0.5rem'
                            }}
                        >
                            <Menu size={24} color="#1a1a1a" />
                        </button>

                        <span style={{ color: '#71717a', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                            <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>/</span>
                            {location.pathname.split('/').filter(x => x && x !== 'admin-panel').map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' / ') || 'Dashboard'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } }} className="desktop-only">
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{user.email}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>System Administrator</p>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                            {user.email[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <main style={{ padding: '1.5rem', flex: 1, overflowX: 'hidden' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
