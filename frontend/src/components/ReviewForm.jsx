import { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';

const ReviewForm = ({ productSlug, onReviewSubmitted }) => {
    const { showNotification } = useNotifications();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (rating === 0) {
            setError("Please select a rating.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('product_slug', productSlug);
        formData.append('rating', rating);
        formData.append('comment', comment);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('reviews/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification('Review submitted successfully!', 'success');
            setRating(0);
            setComment('');
            setImage(null);
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setError(err.response.data.detail || "You can only review products you have purchased and received.");
            } else {
                setError("Failed to submit review. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem', background: '#fafafa', border: '1px solid #f4f4f5' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Write a Review</h3>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#71717a', marginBottom: '0.5rem' }}>
                        RATING
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setRating(star)}
                                style={{
                                    background: 'transparent',
                                    padding: 0,
                                    color: star <= rating ? '#fbbf24' : '#e4e4e7',
                                    cursor: 'pointer'
                                }}
                            >
                                <Star size={28} fill={star <= rating ? "currentColor" : "none"} />
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#71717a', marginBottom: '0.5rem' }}>
                        YOUR EXPERIENCE
                    </label>
                    <textarea
                        className="input-field"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the product..."
                        required
                        style={{ height: 'auto', borderRadius: '20px' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#71717a', marginBottom: '0.5rem' }}>
                        PHOTO (OPTIONAL)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                background: 'white',
                                border: '1px solid #e4e4e7',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#52525b'
                            }}
                        >
                            <Upload size={18} />
                            Choose Image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {image && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#71717a' }}>
                                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {image.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    style={{ background: 'transparent', padding: '0.25rem', color: '#ef4444' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
