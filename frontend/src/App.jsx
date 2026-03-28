import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import SellerDashboard from './pages/seller/SellerDashboard'
import PostAd from './pages/seller/PostAd'
import MyAds from './pages/seller/MyAds'
import ManageBids from './pages/seller/ManageBids'
import SellerTransactions from './pages/seller/SellerTransactions'
import SellerMarketplace from './pages/seller/SellerMarketplace'
import SellerBids from './pages/seller/SellerBids'
import PaymentSettings from './pages/seller/PaymentSettings'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import AvailableAds from './pages/buyer/AvailableAds'
import AdDetails from './pages/buyer/AdDetails'
import MyBids from './pages/buyer/MyBids'
import ActiveDeal from './pages/buyer/ActiveDeal'
import MarketplaceDetails from './pages/shared/MarketplaceDetails'
import PublicMarketplace from './pages/public/PublicMarketplace'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAds from './pages/admin/AdminAds'
import AdminTransactions from './pages/admin/AdminTransactions'
import PlatformSettings from './pages/admin/PlatformSettings'
import SellerProfile from './pages/seller/SellerProfile'
import BuyerProfile from './pages/buyer/BuyerProfile'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard'} replace />
  }

  return children
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/explore" element={<PublicMarketplace />} />
      
      <Route path="/seller" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="post-ad" element={<PostAd />} />
        <Route path="post-ad/:id" element={<PostAd />} />
        <Route path="my-ads" element={<MyAds />} />
        <Route path="my-ads/:id" element={<ManageBids />} />
        <Route path="marketplace" element={<SellerMarketplace />} />
        <Route path="marketplace/:id" element={<MarketplaceDetails />} />
        <Route path="my-bids" element={<SellerBids />} />
        <Route path="transactions" element={<SellerTransactions />} />
        <Route path="payment-settings" element={<PaymentSettings />} />
        <Route path="profile" element={<SellerProfile />} />
      </Route>

      <Route path="/buyer" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="available-ads" element={<AvailableAds />} />
        <Route path="available-ads/:id" element={<AdDetails />} />
        <Route path="my-bids" element={<MyBids />} />
        <Route path="active-deal" element={<ActiveDeal />} />
        <Route path="profile" element={<BuyerProfile />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="settings" element={<PlatformSettings />} />
      </Route>
    </Routes>
  )
}

export default App
