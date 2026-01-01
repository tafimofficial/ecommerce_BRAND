import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const BASE_URL = `http://${window.location.hostname}:8000`;

    useEffect(() => {
        api.get('products/')
            .then(res => setProducts(res.data.results || res.data))
            .catch(err => console.error(err));

        api.get('banners/')
            .then(res => setBanners(res.data.results || res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % banners.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [banners]);

    return (
        <div style={{ background: 'var(--bg-color)', overflow: 'hidden' }}>
            {/* Hero Slider Section */}
            <div style={{ padding: '2rem 0' }}>
                <div className="container">
                    {banners.length > 0 ? (
                        <div style={{
                            position: 'relative',
                            height: 'clamp(400px, 60vh, 600px)',
                            width: '100%',
                            borderRadius: 'var(--border-radius-lg)',
                            overflow: 'hidden',
                            background: '#000',
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)'
                        }}>
                            <AnimatePresence mode="wait">
                                {banners.map((banner, index) => index === currentSlide && (
                                    <motion.div
                                        key={banner.id}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 10
                                        }}
                                    >
                                        <img
                                            src={banner.image.startsWith('http') ? banner.image : `${BASE_URL}${banner.image}`}
                                            alt={banner.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.1)' }}
                                        />

                                        <div
                                            className="banner-text-content"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 10%'
                                            }}
                                        >
                                            <div style={{ maxWidth: '800px', color: 'white' }}>
                                                <motion.h1
                                                    className="banner-title"
                                                    initial={{ opacity: 0, y: 40 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3, duration: 0.8 }}
                                                    style={{
                                                        // Fallback for desktop if class not fully picked up or overridden
                                                        // But relying on class for mobile override
                                                        fontSize: '5rem',
                                                        fontWeight: '800',
                                                        margin: '0 0 1.5rem 0',
                                                        lineHeight: 1,
                                                        letterSpacing: '-3px'
                                                    }}
                                                >
                                                    {banner.title}.
                                                </motion.h1>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5, duration: 0.8 }}
                                                    style={{
                                                        fontSize: '1.4rem',
                                                        marginBottom: '2.5rem',
                                                        opacity: 0.8,
                                                        fontWeight: '500',
                                                        maxWidth: '600px'
                                                    }}
                                                >
                                                    {banner.description}
                                                </motion.p>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.7, duration: 0.8 }}
                                                >
                                                    <a href={banner.link || '/shop'} className="btn btn-accent" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
                                                        Explore Collection
                                                    </a>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Progress Indicators */}
                            <div style={{ position: 'absolute', bottom: '40px', left: '10%', display: 'flex', gap: '12px', zIndex: 20 }}>
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        style={{
                                            width: idx === currentSlide ? '60px' : '30px',
                                            height: '4px',
                                            borderRadius: '2px',
                                            background: idx === currentSlide ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                                            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '400px', background: 'var(--gray-100)', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <h2 style={{ opacity: 0.3 }}>LOADING TRENDS...</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Collection Section */}
            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Featured Collection.</h2>
                        <p>Discover our meticulously curated selection of world-class products designed for the contemporary lifestyle.</p>
                    </motion.div>

                    <div className="grid-products">
                        {products.slice(0, 8).map((product, idx) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <motion.div
                        style={{ textAlign: 'center', marginTop: '5rem' }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <a href="/shop" className="btn btn-outline" style={{ padding: '1.2rem 4rem' }}>
                            View Entire Shop
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Banner Call to Action */}
            <section style={{ background: '#000', color: '#fff', padding: '10rem 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', marginBottom: '2rem', letterSpacing: '-5px' }}>OWN THE STYLE.</h2>
                        <p style={{ fontSize: '1.5rem', opacity: 0.6, maxWidth: '700px', margin: '0 auto 4rem auto' }}>
                            Join our inner circle and be the first to access limited edition drops and exclusive seasonal sales.
                        </p>
                        <a href="/register" className="btn btn-accent" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem' }}>
                            Join Now
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
