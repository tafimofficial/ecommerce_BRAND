import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState(null);

    const showModal = useCallback((config) => {
        return new Promise((resolve) => {
            setModalConfig({
                ...config,
                onConfirm: (value) => {
                    setModalConfig(null);
                    resolve(value);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(null);
                }
            });
        });
    }, []);

    const confirm = (title, message, confirmText = 'Confirm', type = 'confirm') => {
        return showModal({ title, message, confirmText, type });
    };

    const prompt = (title, message, defaultValue = '', confirmText = 'Submit') => {
        return showModal({ title, message, defaultValue, confirmText, type: 'prompt' });
    };

    return (
        <ModalContext.Provider value={{ confirm, prompt }}>
            {children}
            {modalConfig && (
                <Modal
                    isOpen={!!modalConfig}
                    {...modalConfig}
                />
            )}
        </ModalContext.Provider>
    );
};
