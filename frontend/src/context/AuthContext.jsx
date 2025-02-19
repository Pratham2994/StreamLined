// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create the authentication context
export const AuthContext = createContext(null);

// AuthProvider fetches the current user on mount by calling the profile endpoint.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // e.g. { role: 'admin', email: 'user@example.com' }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assumes you have a /api/users/profile endpoint that returns the user details if token is valid.
    fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      credentials: 'include'
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
