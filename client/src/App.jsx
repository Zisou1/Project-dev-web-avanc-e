import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './layout/layout'
import DashboardLayout from './layout/DashboardLayout'
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
import AccueilLivreur from './pages/livreur/AccueilLivreur'
import ItemsPage from './pages/restaurant/ItemsPage'
import AddItemPage from './pages/restaurant/AddItemPage'
import EditItemPage from './pages/restaurant/EditItemPage'
import OrdersPage from './pages/restaurant/OrdersPage'
import OrderDetailPage from './pages/restaurant/OrderDetailPage'
import OrderTrackingPage from './pages/restaurant/OrderTrackingPage'
import OrderHistoryPage from './pages/restaurant/OrderHistoryPage'

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
          
          {/* public Routes with Layout */}
          <Route path="/" element={
            <Layout>
              <ClientPage />
            </Layout>
          } />         
          
          {/* Restaurant Routes with DashboardLayout */}
          <Route path="/restaurant" element={
            <ProtectedRoute requiredRole="restaurant">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Nested restaurant routes */}
            <Route index element={<RestaurantPage />} />
            <Route path="dashboard" element={<RestaurantPage />} />
            <Route path="menu" element={<div>Menu Management Page</div>} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="items/add" element={<AddItemPage />} />
            <Route path="items/edit/:id" element={<EditItemPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId/tracking" element={<OrderTrackingPage />} />
            <Route path="orders/history" element={<OrderHistoryPage />} />
            <Route path="orders/history/:orderId/detail" element={<OrderDetailPage />} />
            <Route path="analytics" element={<div>Restaurant Analytics Page</div>} />
            <Route path="profile" element={<div>Restaurant Profile Page</div>} />
            <Route path="settings" element={<div>Restaurant Settings Page</div>} />
          </Route>
          
          {/* Livreur Routes with DashboardLayout */}
          <Route path="/livreur" element={
            <ProtectedRoute requiredRole="delivery">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Nested livreur routes */}
            <Route index element={<AccueilLivreur />} />
            <Route path="dashboard" element={<AccueilLivreur />} />
            <Route path="orders" element={<div>Available Orders Page</div>} />
            <Route path="deliveries" element={<div>My Deliveries Page</div>} />
            <Route path="earnings" element={<div>Earnings Page</div>} />
            <Route path="profile" element={<div>Livreur Profile Page</div>} />
            <Route path="settings" element={<div>Livreur Settings Page</div>} />
          </Route>
          
          {/* Admin Routes with DashboardLayout */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
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
