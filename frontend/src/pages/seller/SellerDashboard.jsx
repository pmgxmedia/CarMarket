import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { getStatusLabel } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'
import { useAuth } from '../../context/AuthContext'

const SellerDashboard = () => {
  const { formatPrice } = useCurrency()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ ads: [], transactions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [adsRes, transactionsRes] = await Promise.all([
        api.get('/ads/my-ads'),
        api.get('/transactions')
      ])
      setStats({
        ads: adsRes.data.data || adsRes.data || [],
        transactions: transactionsRes.data.data || transactionsRes.data || []
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  const activeAds = stats.ads.filter(ad => !['completed', 'closed'].includes(ad.status))
  const completedAds = stats.ads.filter(ad => ad.status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <Link
          to="/seller/post-ad"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Post New Ad
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-2">📋</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Total Ads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stats.ads.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-2">⏳</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Active Ads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{activeAds.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-2">✅</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Completed</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{completedAds.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="text-2xl md:text-3xl mb-2">💰</div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Total Sales</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            {formatPrice(stats.transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0))}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Active Ads</h2>
          <Link
            to="/seller/my-ads"
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            View All
          </Link>
        </div>
        {activeAds.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No active ads</p>
            <Link to="/seller/post-ad" className="text-primary-600 hover:underline mt-2 inline-block dark:text-primary-400">
              Post your first ad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-xs md:text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3 hidden sm:table-cell">Price</th>
                  <th className="pb-3 hidden sm:table-cell">Bids</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAds.slice(0, 5).map((ad) => (
                  <tr key={ad._id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <td className="py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        {ad.images?.[0] ? (
                          <img
                            src={ad.images[0].url}
                            alt={ad.model}
                            className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            🚗
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">{ad.make} {ad.model}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{formatPrice(ad.askingPrice)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell font-medium text-gray-800 dark:text-white">{formatPrice(ad.askingPrice)}</td>
                    <td className="py-4 hidden sm:table-cell text-gray-600 dark:text-gray-300 text-sm">
                      {ad.initialBids?.length || 0}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {getStatusLabel(ad.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/seller/my-ads/${ad._id}`}
                        className="text-primary-600 hover:underline text-sm dark:text-primary-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/seller/marketplace"
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Browse Marketplace</h3>
              <p className="text-blue-100 text-sm mt-1">View other sellers' ads and place bids</p>
            </div>
            <span className="text-3xl">🏪</span>
          </div>
        </Link>
        
        <Link
          to="/seller/my-bids"
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">My Bids</h3>
              <p className="text-green-100 text-sm mt-1">View and manage your placed bids</p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        </Link>
      </div>

      {completedAds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Completed Sales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAds.slice(0, 3).map((ad) => (
              <div key={ad._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {ad.images?.[0] && (
                    <img src={ad.images[0].url} alt={ad.model} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">{ad.make} {ad.model}</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{ad.year}</p>
                    <p className="text-primary-600 font-semibold mt-1 dark:text-primary-400 text-sm md:text-base">
                      Sold for {formatPrice(ad.finalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard

const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    bidding: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    inspection_phase: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}
