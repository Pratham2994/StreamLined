import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminHome from './components/AdminHome';
import CustomerHome from './components/CustomerHome';
import CartPage from './components/CartPage';
import MyOrderPage from './components/MyOrderPage';
import NoterHome from './components/NoterHome';
import NoterCart from './components/NoterCart';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './app.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/cart"
            element={
              <ProtectedRoute requiredRole="customer">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute requiredRole="customer">
                <MyOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/noter"
            element={
              <ProtectedRoute requiredRole="noter">
                <NoterHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/noter/cart"
            element={
              <ProtectedRoute requiredRole="noter">
                <NoterCart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
