// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/axios';

// Create the authentication context
export const AuthContext = createContext(null);

// AuthProvider fetches the current user on mount by calling the profile endpoint.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (initialCheckDone.current) return;
      
      try {
        const response = await axiosInstance.get('/api/users/profile');
        setUser(response.data);
        localStorage.setItem('isAuthenticated', 'true');
      } catch (error) {
        setUser(null);
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
        initialCheckDone.current = true;
      }
    };

    if (!initialCheckDone.current) {
      checkAuth();
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/users/login', { email, password });
      setUser(response.data);
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, role: response.data.role };
    } catch (error) {
      localStorage.removeItem('isAuthenticated');
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/users/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      setLoading(false);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
