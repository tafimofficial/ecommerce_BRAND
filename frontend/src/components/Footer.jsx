import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings, footerSections } = useSettings();

    return (
        <footer style={{ background: '#000', color: '#fff', padding: '8rem 0 4rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
                    {/* Brand Section */}
                    <div style={{ maxWidth: '300px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-2px', marginBottom: '1.5rem', lineHeight: 1 }}>{settings.brand_name}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '2rem' }}>
                            {settings.about_text}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <motion.a whileHover={{ y: -5 }} href={settings.instagram_url} target="_blank" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '50%', color: '#fff' }}><Instagram size={20} /></motion.a>
                            <motion.a whileHover={{ y: -5 }} href={settings.twitter_url} target="_blank" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '50%', color: '#fff' }}><Twitter size={20} /></motion.a>
                            <motion.a whileHover={{ y: -5 }} href={settings.facebook_url} target="_blank" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '50%', color: '#fff' }}><Facebook size={20} /></motion.a>
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    {footerSections.map(section => (
                        <div key={section.id}>
                            <h4 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2rem' }}>{section.name}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.2rem' }}>
                                {section.links.map(link => (
                                    <li key={link.id}>
                                        <Link to={link.url} style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                            {link.name.toUpperCase()}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2rem' }}>Headquarters</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.5rem' }}>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                <MapPin size={20} /> {settings.footer_address}
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                <Phone size={20} /> {settings.footer_phone}
                            </li>
                            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                <Mail size={20} /> {settings.footer_email}
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} {settings.brand_name} BUILT FOR THE EXTRAORDINARY.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 700 }}>VISA</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 700 }}>MASTERCARD</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 700 }}>BKASH</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
