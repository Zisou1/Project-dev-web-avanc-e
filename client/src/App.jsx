import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './layout/layout'
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
import Profillivreur from './pages/livreur/profillivreur'

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
          
          <Route path="/client" element={
            
            <Layout>
              <ClientPage />
            </Layout>
          } />
          
          <Route path="/restaurant" element={
            <ProtectedRoute>
              <Layout>
                <RestaurantPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/livreur" element={
            <ProtectedRoute>
              <Layout>
                <LivreurPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/livreur/profile" element={
            <ProtectedRoute requiredRole="delivery">
              <Layout>
                <Profillivreur />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
