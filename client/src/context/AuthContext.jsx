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
  const abortControllerRef = useRef(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchProfile = async () => {
      // Skip if we've already done the initial check or exceeded retries
      if (initialCheckDone.current || retryCount.current >= MAX_RETRIES) {
        setLoading(false);
        return;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await axiosInstance.get('/api/users/profile', {
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          timeout: 5000 // 5 second timeout
        });
        
        // Only update state if the component is still mounted
        if (!abortControllerRef.current.signal.aborted) {
          setUser(response.data);
          initialCheckDone.current = true;
          retryCount.current = 0; // Reset retry count on success
        }
      } catch (error) {
        // Ignore aborted requests
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return;
        }

        // Handle network errors
        if (!error.response || error.code === 'ECONNABORTED') {
          console.error('Network error:', error);
          retryCount.current++;
          
          // If we haven't exceeded retries, try again after a delay
          if (retryCount.current < MAX_RETRIES) {
            setTimeout(fetchProfile, 1000 * retryCount.current);
            return;
          }
        }
        
        // Don't log 401s as they're expected for non-logged in users
        if (error.response?.status !== 401) {
          console.error('Error fetching profile:', error);
        }
        
        if (!abortControllerRef.current.signal.aborted) {
          setUser(null);
          initialCheckDone.current = true;
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    // Cleanup function to cancel any pending requests when component unmounts
    // or when the effect runs again
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      initialCheckDone.current = false;
      retryCount.current = 0;
      
      const response = await axiosInstance.post('/api/users/login', 
        { email, password },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      setUser(response.data);
      return { success: true, role: response.data.role };
    } catch (error) {
      console.error('Login error:', error);
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      await axiosInstance.post('/api/users/logout', null, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      initialCheckDone.current = false;
      retryCount.current = 0;
      setLoading(false);
      
      // Clear any cached responses
      if ('caches' in window) {
        try {
          await caches.delete('api-cache');
        } catch (e) {
          console.error('Error clearing cache:', e);
        }
      }
      
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
