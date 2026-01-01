import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        brand_name: 'BRAND',
        about_text: '',
        footer_address: '',
        footer_phone: '',
        footer_email: '',
        instagram_url: '',
        twitter_url: '',
        facebook_url: ''
    });
    const [footerSections, setFooterSections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const [settingsRes, footerRes] = await Promise.all([
                api.get('site-settings/'),
                api.get('footer-sections/')
            ]);
            setSettings(settingsRes.data);
            setFooterSections(footerRes.data.results || footerRes.data);
        } catch (error) {
            console.error('Failed to fetch site settings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = () => fetchSettings();

    return (
        <SettingsContext.Provider value={{ settings, footerSections, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
