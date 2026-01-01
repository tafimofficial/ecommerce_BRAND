import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await api.post('auth/login/', { email, password });
            setToken(response.data.token);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            // Extract meaningful error message
            let message = "Login failed. Please check your credentials.";
            if (error.response?.data?.non_field_errors) {
                message = error.response.data.non_field_errors[0];
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.response?.data?.email) {
                message = `Email: ${error.response.data.email[0]}`;
            } else if (error.response?.data?.password) {
                message = `Password: ${error.response.data.password[0]}`;
            }
            throw new Error(message);
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('auth/register/', userData);
            setToken(response.data.token);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            let message = "Registration failed. Please try again.";
            if (error.response?.data) {
                const data = error.response.data;
                // Handle various DRF error formats
                if (data.email) message = `Email: ${data.email[0]}`;
                else if (data.username) message = `Username: ${data.username[0]}`;
                else if (data.password) message = `Password: ${data.password[0]}`;
                else if (data.non_field_errors) message = data.non_field_errors[0];
                else if (data.detail) message = data.detail;
                else {
                    // If complex nested object, try to grab first error
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && Array.isArray(data[firstKey])) {
                        message = `${firstKey}: ${data[firstKey][0]}`;
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                }
            }
            throw new Error(message);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
