// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the authentication context
export const AuthContext = createContext(null);

// AuthProvider fetches the current user on mount by calling the profile endpoint.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // e.g. { role: 'admin', email: 'user@example.com' }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        // Clear tokens on error
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await fetch('http://localhost:3000/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token from localStorage and cookies
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Clear user state
      setUser(null);
      
      // Redirect to home page will be handled by the component that calls logout
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
