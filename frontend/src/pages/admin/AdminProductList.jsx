import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useModal } from '../../context/ModalContext';
import { Plus, Search, Edit3, Trash2, Package, Layers, DollarSign, Archive, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '../../components/ui/Dropdown';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const { token } = useAuth();
    const { showNotification } = useNotifications();
    const { confirm } = useModal();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', stock: '', category: '', subcategory: '', image: null, images: [], sizes: '', colors: ''
    });
    const [categories, setCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [editingSlug, setEditingSlug] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const BASE_URL = `http://${window.location.hostname}:8000`;

    useEffect(() => {
        fetchProducts();
        api.get('categories/').then(res => setCategories(res.data.results || res.data));
    }, []);

    useEffect(() => {
        if (formData.category) {
            const cat = categories.find(c => c.id == formData.category);
            setFilteredSubCategories(cat ? cat.subcategories : []);
        } else {
            setFilteredSubCategories([]);
        }
    }, [formData.category, categories]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('products/');
            setProducts(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        const ok = await confirm("Confirm Extermination", "Eradicate this product from the registry? This action is irreversible.", "Terminate");
        if (!ok) return;
        try {
            await api.delete(`products/${slug}/`, { headers: { Authorization: `Token ${token}` } });
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification('Extermination failed. Asset remains locked.', 'error');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category?.id || '',
            subcategory: product.subcategory?.id || '',
            image: null,
            sizes: product.sizes ? product.sizes.join(', ') : '',
            colors: product.colors ? product.colors.join(', ') : ''
        });
        setEditingSlug(product.slug);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        if (formData.category) data.append('category_id', formData.category);
        if (formData.subcategory) data.append('subcategory_id', formData.subcategory);

        // Variants
        const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
        const colorsArray = formData.colors.split(',').map(c => c.trim()).filter(c => c);

        // Append as JSON strings 
        data.append('sizes', JSON.stringify(sizesArray));
        data.append('colors', JSON.stringify(colorsArray));

        // Single main image (optional, for backward compatibility or main display)
        if (formData.images && formData.images.length > 0) {
            data.append('image', formData.images[0]);
            formData.images.forEach(image => {
                data.append('uploaded_images', image);
            });
        }

        try {
            if (editingSlug) {
                await api.patch(`products/${editingSlug}/`, data, {
                    headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('products/', data, {
                    headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowForm(false);
            setEditingSlug(null);
            fetchProducts();
            setFormData({ name: '', description: '', price: '', stock: '', category: '', subcategory: '', image: null, images: [], sizes: '', colors: '' });
        } catch (error) {
            console.error(error);
            showNotification('Integrity check failed. Could not authorize product persistence.', 'error');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: 0 }}>Inventory Hub.</h1>
                    <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>Curate and manage your luxury catalog.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="text"
                            placeholder="Identify product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '100%', paddingLeft: '3.5rem', background: 'white' }}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingSlug(null);
                            setFormData({ name: '', description: '', price: '', stock: '', category: '', subcategory: '', image: null, images: [], sizes: '', colors: '' });
                        }}
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'CLOSE' : 'ADD PRODUCT'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card"
                        style={{ padding: '2rem', marginBottom: '3rem', background: 'white', border: '1px solid #f4f4f5' }}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>{editingSlug ? 'Update Specification' : 'New Catalog Entry'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>PRODUCT NAME</span>
                                <input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>UNIT PRICE (৳)</span>
                                <input className="input-field" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            </label>
                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>DESCRIPTION</span>
                                <textarea className="input-field" rows="4" style={{ height: 'auto' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>STOCK AVAILABLE</span>
                                <input className="input-field" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>SIZES (Comma separation)</span>
                                <input
                                    className="input-field"
                                    placeholder="e.g. S, M, L, XL"
                                    value={formData.sizes}
                                    onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>COLORS (Comma separation)</span>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Red, Blue, Matte Black"
                                    value={formData.colors}
                                    onChange={e => setFormData({ ...formData, colors: e.target.value })}
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>MAIN CATEGORY</span>
                                <Dropdown
                                    options={[
                                        { value: '', label: 'Choose Category' },
                                        ...categories.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                    value={formData.category}
                                    onChange={(val) => setFormData({ ...formData, category: val, subcategory: '' })}
                                    width="100%"
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>SUB-CATEGORY</span>
                                <Dropdown
                                    options={[
                                        { value: '', label: 'Select Sub (Optional)' },
                                        ...filteredSubCategories.map(sub => ({ value: sub.id, label: sub.name }))
                                    ]}
                                    value={formData.subcategory}
                                    onChange={(val) => setFormData({ ...formData, subcategory: val })}
                                    width="100%"
                                />
                            </label>
                            <label>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a', display: 'block', marginBottom: '0.5rem' }}>PRODUCT IMAGES</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={e => setFormData({ ...formData, images: Array.from(e.target.files) })}
                                    className="input-field"
                                />
                            </label>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 4rem' }}>{editingSlug ? 'SYNCHRONIZE UPDATE' : 'COMMENCE STORAGE'}</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Table View */}
            <div className="card desktop-table-view" style={{ padding: '0.5rem', background: 'white', overflow: 'hidden', border: '1px solid #f4f4f5' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Preview</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Product Details</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Pricing</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Inventory</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Category Path</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f4f4f5' }} className="table-row-hover">
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        {product.image ? (
                                            <img
                                                src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}
                                                alt={product.name}
                                                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', background: '#f8fafc' }}
                                            />
                                        ) : (
                                            <div style={{ width: '64px', height: '64px', background: '#f4f4f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d4d8' }}>
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-color)' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>{product.description}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.7rem', color: '#71717a' }}>
                                            {Array.isArray(product.sizes) && product.sizes.length > 0 && <span>Size: {product.sizes.join(', ')}</span>}
                                            {Array.isArray(product.colors) && product.colors.length > 0 && <span>Color: {product.colors.join(', ')}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                            <DollarSign size={14} color="#10b981" />
                                            {product.price}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Archive size={14} color={product.stock < 10 ? '#ef4444' : '#71717a'} />
                                            <span style={{ fontWeight: 700, color: product.stock < 10 ? '#ef4444' : 'inherit' }}>{product.stock}</span>
                                        </div>
                                        {product.stock < 10 && <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800 }}>LOW STOCK</div>}
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#71717a' }}>{product.category?.name}</div>
                                        {product.subcategory?.name && (
                                            <div style={{ fontSize: '0.75rem', background: '#f4f4f5', padding: '0.1rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>{product.subcategory.name}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f4f4f5', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.slug)}
                                                style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', border: 'none', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem', color: '#a1a1aa' }}>
                        No product matches found in the registry.
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="mobile-card-view" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
                {filteredProducts.map(product => (
                    <div key={product.id} className="card" style={{ padding: '1.5rem', background: 'white', border: '1px solid #f4f4f5' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            {product.image ? (
                                <img
                                    src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}
                                    alt={product.name}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', background: '#f8fafc' }}
                                />
                            ) : (
                                <div style={{ width: '80px', height: '80px', background: '#f4f4f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d4d8' }}>
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>{product.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{product.category?.name}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a1a1aa' }}>
                                    {Array.isArray(product.sizes) && product.sizes.length > 0 && <div style={{ marginBottom: '0.1rem' }}>S: {product.sizes.join(', ')}</div>}
                                    {Array.isArray(product.colors) && product.colors.length > 0 && <div>C: {product.colors.join(', ')}</div>}
                                </div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#10b981' }}>৳{product.price}</span>
                                    {product.stock < 10 && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800, background: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>LOW STOCK ({product.stock})</span>}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f4f4f5', paddingTop: '1rem' }}>
                            <button
                                onClick={() => handleEdit(product)}
                                className="btn"
                                style={{ background: '#f4f4f5', color: '#09090b', padding: '0.75rem', fontSize: '0.85rem' }}
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(product.slug)}
                                className="btn"
                                style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', fontSize: '0.85rem' }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                        No product matches found.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminProductList;
