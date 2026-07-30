import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CarsPage from '../pages/CarsPage';
import CarDetailPage from '../pages/CarDetailPage';
import AddCarPage from '../pages/AddCarPage';
import EditCarPage from '../pages/EditCarPage';
import DashboardPage from '../pages/DashboardPage';
import InventoryPage from '../pages/InventoryPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ComparePage from '../pages/ComparePage';
import MyBookingsPage from '../pages/MyBookingsPage';
import AdminBookingsPage from '../pages/AdminBookingsPage';
import MyPurchasesPage from '../pages/MyPurchasesPage';

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/cars/:id" element={<CarDetailPage />} />
      <Route path="/compare" element={<ComparePage />} />

      {/* Protected (any authenticated user) */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/my-purchases" element={<ProtectedRoute><MyPurchasesPage /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
      <Route path="/inventory" element={<AdminRoute><InventoryPage /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
      <Route path="/cars/add" element={<AdminRoute><AddCarPage /></AdminRoute>} />
      <Route path="/cars/:id/edit" element={<AdminRoute><EditCarPage /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

export default AppRoutes;
