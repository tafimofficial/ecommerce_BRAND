import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const BASE_URL = `http://${window.location.hostname}:8000`;

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <Link to={`/product/${product.slug}`} style={{ overflow: 'hidden', display: 'block' }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    style={{
                        height: '320px',
                        background: 'var(--gray-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    {product.image ? (
                        <img
                            src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <span style={{ color: '#999', fontWeight: 600 }}>NO PRODUCT IMAGE</span>
                    )}
                </motion.div>
            </Link>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Link to={`/product/${product.slug}`}>
                    <h3 style={{
                        margin: '0 0 0.5rem',
                        fontSize: '1.25rem',
                        lineHeight: '1.2',
                        color: 'var(--primary-color)'
                    }}>
                        {product.name}
                    </h3>
                </Link>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: '1rem'
                }}>
                    <span style={{
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        color: 'var(--primary-color)'
                    }}>
                        ৳{product.price}
                    </span>

                    <motion.button
                        whileHover={(product.stock > 0 && product.is_available) ? { scale: 1.1 } : {}}
                        whileTap={(product.stock > 0 && product.is_available) ? { scale: 0.95 } : {}}
                        onClick={(e) => {
                            e.preventDefault();
                            if (product.stock > 0 && product.is_available) {
                                addToCart(product);
                            }
                        }}
                        disabled={!(product.stock > 0 && product.is_available)}
                        style={{
                            background: (product.stock > 0 && product.is_available) ? 'var(--primary-color)' : 'var(--gray-200)',
                            color: (product.stock > 0 && product.is_available) ? 'white' : 'var(--text-muted)',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: (product.stock > 0 && product.is_available) ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            cursor: (product.stock > 0 && product.is_available) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <ShoppingBag size={20} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
