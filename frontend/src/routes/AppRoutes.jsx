import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth pages
import ChangePasswordPage from '../pages/ChangePasswordPage';

// Admin pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminStores from '../pages/AdminStores';

// User pages
import UserStores from '../pages/UserStores';

// Owner pages
import OwnerDashboard from '../pages/OwnerDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />

        {/* Generic Auth Routes (All Roles) */}
        <Route element={<ProtectedRoute />}>
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/stores" element={<AdminStores />} />
        </Route>

        {/* Normal User Routes */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="user/stores" element={<UserStores />} />
        </Route>

        {/* Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="owner/dashboard" element={<OwnerDashboard />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
