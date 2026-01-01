import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { ShoppingCart, Package, Layers, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, categories: 0, totalRevenue: 12540.50 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [p, o, c] = await Promise.all([
                    api.get('products/'),
                    api.get('orders/'),
                    api.get('categories/')
                ]);

                const orders = o.data.results || o.data || [];
                const revenue = orders.reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0);

                setStats({
                    products: p.data.count || p.data.results?.length || p.data.length || 0,
                    orders: o.data.count || o.data.results?.length || o.data.length || 0,
                    categories: c.data.count || c.data.results?.length || c.data.length || 0,
                    totalRevenue: revenue
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Revenue Generated',
            value: `৳${stats.totalRevenue.toLocaleString()}`,
            icon: <TrendingUp size={24} />,
            color: '#8b5cf6',
            trend: '+12.5%',
            desc: 'Total earnings from orders'
        },
        {
            title: 'Order Velocity',
            value: stats.orders,
            icon: <ShoppingCart size={24} />,
            color: '#10b981',
            trend: '+4.2%',
            desc: 'Successfully processed'
        },
        {
            title: 'Inventory Count',
            value: stats.products,
            icon: <Package size={24} />,
            color: '#f59e0b',
            trend: 'Alive',
            desc: 'Active unique products'
        },
        {
            title: 'Architecture',
            value: stats.categories,
            icon: <Layers size={24} />,
            color: '#3b82f6',
            trend: 'Stable',
            desc: 'Catalog categorization'
        },
    ];

    if (loading) return <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Synchronizing data...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Hub Overview.</h1>
                <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>A real-time snapshot of your ethical commerce ecosystem.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="card"
                        style={{
                            padding: '2.5rem',
                            background: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid #f4f4f5'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: `${card.color}15`,
                                color: card.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {card.icon}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: '#f4f4f5',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: card.trend.startsWith('+') ? '#10b981' : '#71717a'
                            }}>
                                {card.trend} {card.trend.startsWith('+') && <ArrowUpRight size={12} />}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#71717a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {card.title}
                        </h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem', letterSpacing: '-1px' }}>
                            {card.value}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
                            {card.desc}
                        </p>

                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            bottom: '-10px',
                            opacity: 0.03,
                            transform: 'rotate(-15deg) scale(2.5)'
                        }}>
                            {card.icon}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity placeholder */}
            <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem', background: 'white', flex: '2 1 280px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Ecosystem Resilience</h3>
                    <div style={{ height: '300px', background: '#fafafa', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f1f1f1' }}>
                        <p style={{ color: '#d4d4d8', fontSize: '0.9rem' }}>Business Intelligence Visualization [Placeholder]</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem', background: 'white', flex: '1 1 280px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>System Health</h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            { name: 'API Services', status: 'Operational', color: '#10b981' },
                            { name: 'Orders Queue', status: 'Optimal', color: '#10b981' },
                            { name: 'Media Storage', status: '92% Capacity', color: '#f59e0b' },
                        ].map(item => (
                            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color, background: `${item.color}15`, padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
