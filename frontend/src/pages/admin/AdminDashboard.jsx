import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">👥</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Total Users</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">🏪</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Sellers</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.sellers || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">🛒</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Buyers</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.buyers || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">📋</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Total Ads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalAds || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">⏳</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Active Ads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.activeAds || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">💰</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Total Transactions</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalTransactions || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 col-span-2 md:col-span-1">
          <div className="text-2xl md:text-3xl mb-1 md:mb-2">✅</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Completed</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats?.completedTransactions || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link to="/admin/users" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow block">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Manage Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all users</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </Link>
        <Link to="/admin/ads" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow block">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Manage Ads</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Moderate all listings</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </Link>
        <Link to="/admin/transactions" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow block">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Transactions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View all transactions</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </Link>
        <Link to="/admin/settings" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow block">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Platform Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Home screen content</p>
            </div>
            <span className="text-2xl">⚙️</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
