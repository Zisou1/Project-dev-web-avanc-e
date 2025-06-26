import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './layout/layout'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import RestaurantPage from './pages/restaurant/restaurantPage'
import ClientPage from './pages/client/clientPage'
import LivreurPage from './pages/livreur/livreurPage'
import AdminPage from './pages/admin/adminPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import RestaurantLivreurLayout from './layout/RestaurantLivreurLayout'
import ItemsPage from './pages/restaurant/ItemsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <Layout>
              <ClientPage />
            </Layout>
          } />         
          <Route path="/restaurant" element={
            <ProtectedRoute requiredRole="restaurant">
              <RestaurantLivreurLayout>
                <RestaurantPage />
              </RestaurantLivreurLayout>
            </ProtectedRoute>
  
            
          } />
          <Route path="/restaurant/items" element={
            <ProtectedRoute requiredRole="restaurant">

                <ItemsPage />

            </ProtectedRoute>
          } />
          
          <Route path="/livreur" element={
            <ProtectedRoute>
              <Layout>
                <LivreurPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Nested admin routes */}
            <Route index element={<AdminPage />} />
            <Route path="dashboard" element={<AdminPage />} />
            <Route path="users" element={<div>Users Management Page</div>} />
            <Route path="restaurants" element={<div>Restaurants Management Page</div>} />
            <Route path="orders" element={<div>Orders Management Page</div>} />
            <Route path="delivery" element={<div>Delivery Management Page</div>} />
            <Route path="analytics" element={<div>Analytics Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
