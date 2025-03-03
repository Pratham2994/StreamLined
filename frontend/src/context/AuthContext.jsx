// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

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
      headers: { 'Authorization': `Bearer ${token}` }, // ✅ Send JWT in headers
      credentials: 'include'
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('token'); // Remove invalid token
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token'); // ✅ Clear JWT on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
