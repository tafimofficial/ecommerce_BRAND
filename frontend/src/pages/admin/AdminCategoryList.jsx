import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Folder, Edit3, Trash2, Plus, Search, Layers, X, ChevronRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm } = useModal();
    const [name, setName] = useState('');
    const [expandedCat, setExpandedCat] = useState(null);
    const [subName, setSubName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('categories/');
            setCategories(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        const ok = await confirm("Confirm Termination", "Delete this category and all associated sub-registries? Data will be permanently purged.", "Terminate");
        if (!ok) return;
        try {
            await api.delete(`categories/${slug}/`, { headers: { Authorization: `Token ${token}` } });
            fetchCategories();
        } catch (error) {
            console.error(error);
            showNotification('Termination failed. Category remains active.', 'error');
        }
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setName(cat.name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            if (editingCategory) {
                await api.patch(`categories/${editingCategory.slug}/`, { name, slug }, { headers: { Authorization: `Token ${token}` } });
                setEditingCategory(null);
            } else {
                await api.post('categories/', { name, slug }, { headers: { Authorization: `Token ${token}` } });
            }
            setName('');
            fetchCategories();
        } catch (error) {
            console.error(error);
            showNotification('Registry sync failed. Could not save category.', 'error');
        }
    };

    const handleSubAdd = async (e, catId) => {
        e.preventDefault();
        try {
            const slug = subName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            await api.post('subcategories/', { name: subName, slug, category: catId }, { headers: { Authorization: `Token ${token}` } });
            setSubName('');
            setExpandedCat(null);
            fetchCategories();
        } catch (error) {
            console.error(error);
            showNotification('Sub-registry sync failed. Could not add subcategory.', 'error');
        }
    };

    const handleSubDelete = async (slug) => {
        const ok = await confirm("Purge Sub-identifier", "Eradicate this sub-specification from the registry?", "Eradicate");
        if (!ok) return;
        try {
            await api.delete(`subcategories/${slug}/`, { headers: { Authorization: `Token ${token}` } });
            fetchCategories();
        } catch (error) {
            console.error(error);
            showNotification('Eradication failed. Subcategory remains locked.', 'error');
        }
    };

    const handleSubEdit = async (sub) => {
        const newName = await customPrompt("Rename Sub-specification", "Synonym for this sub-registry:", sub.name);
        if (newName && newName !== sub.name) {
            try {
                const slug = newName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                await api.patch(`subcategories/${sub.slug}/`, { name: newName, slug }, { headers: { Authorization: `Token ${token}` } });
                fetchCategories();
            } catch (error) {
                console.error(error);
                showNotification('Update failed. Integrity check not passed.', 'error');
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subcategories.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Category Architect.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Structure your storefront's navigation hierarchy.</p>
                </div>

                <div className="mobile-actions-stack" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', minWidth: '280px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '100%', paddingLeft: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e4e4e7' }}
                        />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '3rem', background: '#fff', border: '1px solid #f4f4f5', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={20} color="#000" />
                    {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <form onSubmit={handleAdd} className="rule-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <input
                            placeholder="e.g. Sustainable Materials"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, borderRadius: '14px', padding: '1rem 1.5rem' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {editingCategory && (
                            <button type="button" onClick={() => { setEditingCategory(null); setName(''); }} className="btn" style={{ padding: '1rem 1.5rem', borderRadius: '14px', background: '#f4f4f5', border: 'none', fontWeight: 700, color: '#52525b' }}>
                                CANCEL
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '14px' }}>
                            {editingCategory ? 'UPDATE' : 'CREATE'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <AnimatePresence>
                    {filteredCategories.map(cat => (
                        <motion.div
                            layout
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                border: '1px solid #f4f4f5',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ padding: '2rem', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'white', border: '1px solid #eee', color: '#18181b', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                        <Folder size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#09090b', letterSpacing: '-0.5px' }}>{cat.name}</h3>
                                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>{cat.subcategories?.length || 0} Sub-categories</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(cat)} style={{ width: '36px', height: '36px', background: 'white', border: '1px solid #e4e4e7', borderRadius: '10px', cursor: 'pointer', color: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.slug)} style={{ width: '36px', height: '36px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: 1, marginBottom: '2rem' }}>
                                    {cat.subcategories && cat.subcategories.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {cat.subcategories.map(sub => (
                                                <div key={sub.id} style={{
                                                    background: '#f8fafc',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '10px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    color: '#334155',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    border: '1px solid #f1f5f9'
                                                }}>
                                                    {sub.name}
                                                    <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.2rem', paddingLeft: '0.5rem', borderLeft: '1px solid #cbd5e1' }}>
                                                        <Edit3 size={12} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => handleSubEdit(sub)} />
                                                        <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleSubDelete(sub.slug)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '2rem 0', textAlign: 'center', border: '2px dashed #f4f4f5', borderRadius: '12px' }}>
                                            <p style={{ color: '#d4d4d8', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>No sub-categories defined.</p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={(e) => handleSubAdd(e, cat.id)} style={{ position: 'relative' }}>
                                    <input
                                        placeholder="Add new sub-category..."
                                        className="input-field"
                                        value={expandedCat === cat.id ? subName : ''}
                                        onChange={e => {
                                            setExpandedCat(cat.id);
                                            setSubName(e.target.value);
                                        }}
                                        style={{ marginBottom: 0, fontSize: '0.9rem', padding: '1rem 3rem 1rem 1.25rem', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px' }}
                                        required
                                    />
                                    <button type="submit" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: '#18181b', color: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Plus size={16} />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AdminCategoryList;
