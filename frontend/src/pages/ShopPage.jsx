import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);

    const categorySlug = searchParams.get('category') || 'all';
    const subCategorySlug = searchParams.get('subcategory');
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        setLoading(true);
        fetchProducts();
    }, [categorySlug, subCategorySlug, searchQuery]);

    const fetchProducts = () => {
        let url = 'products/';
        api.get(url)
            .then(res => {
                let allProducts = res.data.results || res.data;

                if (categorySlug !== 'all') {
                    allProducts = allProducts.filter(p => p.category && p.category.slug === categorySlug);
                }

                if (subCategorySlug) {
                    allProducts = allProducts.filter(p => p.subcategory && p.subcategory.slug === subCategorySlug);
                }

                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    allProducts = allProducts.filter(p =>
                        p.name.toLowerCase().includes(lowerQuery) ||
                        (p.description && p.description.toLowerCase().includes(lowerQuery))
                    );
                }

                setProducts(allProducts);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '4rem 0' }}>
            <div className="container">
                <header style={{ marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{
                            fontSize: '5rem',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '-4px',
                            lineHeight: 1
                        }}>
                            {searchQuery ? `"${searchQuery}".` : (categorySlug === 'all' ? 'The Store.' : `${categorySlug}.`)}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {subCategorySlug ? `Exploring ${subCategorySlug} collection` : `Browse our curated directory of masterfully crafted pieces.`}
                        </p>
                    </motion.div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                        <h2 style={{ opacity: 0.2 }}>SELECTING THE BEST...</h2>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {products.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid-products"
                            >
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', padding: '8rem 0', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-lg)', border: '2px dashed var(--gray-200)' }}
                            >
                                <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>No matches found.</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Perhaps try another keyword or category?</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
