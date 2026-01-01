import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, User, Upload, X } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import ReviewForm from '../components/ReviewForm';

const ProductDetailsPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const { showNotification } = useNotifications();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const BASE_URL = `http://${window.location.hostname}:8000`;

    useEffect(() => {
        api.get(`products/${slug}/`)
            .then(res => {
                setProduct(res.data);
                setSelectedImage(res.data.image);

                // Fetch Reviews
                api.get(`reviews/?product_slug=${slug}`).then(reviewRes => {
                    const fetchedReviews = reviewRes.data.results || reviewRes.data;
                    setReviews(fetchedReviews);
                    if (fetchedReviews.length > 0) {
                        const total = fetchedReviews.reduce((sum, rev) => sum + rev.rating, 0);
                        setAverageRating(total / fetchedReviews.length);
                    }
                });
            })
            .catch(err => console.error(err));
    }, [slug]);

    if (!product) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2 style={{ opacity: 0.3 }}>CURATING THE DETAILS...</h2>
        </div>
    );

    const imageUrl = product.image
        ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`)
        : null;

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '4rem 1.5rem' }}>
                <Link to="/shop" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    marginBottom: '3rem',
                    color: 'var(--text-muted)'
                }}>
                    <ArrowLeft size={20} /> BACK TO SHOP
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '5rem', alignItems: 'start' }}>
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '20px',
                            background: '#f8fafc',
                            marginBottom: '1rem',
                            border: '1px solid var(--gray-100)'
                        }}>
                            <motion.img
                                key={selectedImage}
                                src={selectedImage ? (selectedImage.startsWith('http') ? selectedImage : `${BASE_URL}${selectedImage}`) : ''}
                                alt={product.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Thumbnail Strip */}
                        {product.images && product.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {/* Original/Main Image Thumbnail */}
                                <div
                                    onClick={() => setSelectedImage(product.image)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedImage === product.image ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        flexShrink: 0
                                    }}
                                >
                                    <img
                                        src={product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : ''}
                                        alt="Main"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Additional Images Thumbnails */}
                                {product.images.map((img) => (
                                    <div
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.image)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: selectedImage === img.image ? '2px solid var(--primary-color)' : '2px solid transparent',
                                            flexShrink: 0
                                        }}
                                    >
                                        <img
                                            src={img.image ? (img.image.startsWith('http') ? img.image : `${BASE_URL}${img.image}`) : ''}
                                            alt={`View ${img.id}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ paddingTop: '2rem' }}
                    >
                        <h1 style={{
                            fontSize: '4.5rem',
                            marginBottom: '1.5rem',
                            lineHeight: 1,
                            letterSpacing: '-3px'
                        }}>
                            {product.name}.
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                            <span style={{
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                color: 'var(--primary-color)'
                            }}>
                                ৳{product.price}
                            </span>
                            <span style={{
                                background: (product.stock > 0 && product.is_available) ? 'var(--accent-color)' : '#fef2f2',
                                color: (product.stock > 0 && product.is_available) ? 'var(--primary-color)' : '#ef4444',
                                border: (product.stock > 0 && product.is_available) ? 'none' : '1px solid #fecaca',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '50px',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase'
                            }}>
                                {(product.stock > 0 && product.is_available) ? 'IN STOCK' : 'OUT OF STOCK'}
                            </span>
                        </div>

                        <p style={{
                            fontSize: '1.25rem',
                            lineHeight: 1.6,
                            marginBottom: '4rem',
                            color: 'var(--text-muted)',
                            maxWidth: '550px'
                        }}>
                            {product.description || "Indulge in the epitome of luxury and design. This exclusive piece is crafted for those who define their own standards of excellence."}
                        </p>

                        {/* Variants Selection */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            {product.sizes && product.sizes.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Size</h4>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    border: selectedSize === size ? '2px solid var(--primary-color)' : '1px solid var(--gray-200)',
                                                    background: selectedSize === size ? 'var(--primary-color)' : 'transparent',
                                                    color: selectedSize === size ? 'white' : 'var(--text-color)',
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    minWidth: '60px'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Color</h4>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    border: selectedColor === color ? '2px solid var(--primary-color)' : '1px solid var(--gray-200)',
                                                    background: selectedColor === color ? 'var(--primary-color)' : 'transparent',
                                                    color: selectedColor === color ? 'white' : 'var(--text-color)',
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <motion.button
                                whileHover={(product.stock > 0 && product.is_available) ? { scale: 1.02 } : {}}
                                whileTap={(product.stock > 0 && product.is_available) ? { scale: 0.98 } : {}}
                                className="btn btn-primary"
                                style={{
                                    padding: '1.5rem 4rem',
                                    fontSize: '1.1rem',
                                    flex: 1,
                                    opacity: (product.stock > 0 && product.is_available) ? 1 : 0.5,
                                    cursor: (product.stock > 0 && product.is_available) ? 'pointer' : 'not-allowed',
                                    filter: (product.stock > 0 && product.is_available) ? 'none' : 'grayscale(1)'
                                }}
                                onClick={() => {
                                    if (product.stock <= 0 || !product.is_available) return;

                                    // Validation
                                    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                                        showNotification('Please select a size preference.', 'error');
                                        return;
                                    }
                                    if (product.colors && product.colors.length > 0 && !selectedColor) {
                                        showNotification('Please select a color option.', 'error');
                                        return;
                                    }

                                    addToCart(product, 1, selectedSize, selectedColor);
                                    showNotification('Added to cart successfully!', 'success');
                                }}
                                disabled={!(product.stock > 0 && product.is_available)}
                            >
                                <ShoppingBag size={22} style={{ marginRight: '10px' }} />
                                {(product.stock > 0 && product.is_available) ? 'ADD TO CART' : 'OUT OF STOCK'}
                            </motion.button>
                        </div>

                        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--gray-100)', paddingTop: '3rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Premium Delivery</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fast and secure shipping to your doorstep.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Product Reviews Section */}
                <div style={{ marginTop: '5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Customer Reviews</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>{averageRating.toFixed(1)}</span>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} color="#fbbf24" />
                                ))}
                            </div>
                            <span style={{ color: '#71717a', fontSize: '1rem' }}>({reviews.length} reviews)</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>

                        {/* Review Form */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                            <ReviewForm
                                productSlug={slug}
                                onReviewSubmitted={() => {
                                    api.get(`reviews/?product_slug=${slug}`).then(res => {
                                        const r = res.data.results || res.data;
                                        setReviews(r);
                                        if (r.length > 0) {
                                            const total = r.reduce((sum, rev) => sum + rev.rating, 0);
                                            setAverageRating(total / r.length);
                                        }
                                    });
                                }}
                            />
                        </div>

                        {reviews.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#71717a', background: '#fafafa', borderRadius: '20px' }}>
                                No reviews yet. Verified purchasers can leave a review here.
                            </div>
                        ) : (
                            reviews.map(review => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="card"
                                    style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{review.user_name || 'Verified Customer'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>

                                    <p style={{ color: '#52525b', lineHeight: 1.6, fontSize: '1rem' }}>
                                        {review.comment}
                                    </p>

                                    {review.image && (
                                        <div style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                                            <img
                                                src={review.image}
                                                alt="Review attachment"
                                                style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
                                                onClick={() => window.open(review.image, '_blank')}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
