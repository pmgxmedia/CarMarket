import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useCurrency } from '../../context/CurrencyContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const BuyerDashboard = () => {
  const { formatPrice } = useCurrency()
  const { user, becomeSeller } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ myBids: [], transactions: [] })
  const [availableAds, setAvailableAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSellerModal, setShowSellerModal] = useState(false)
  const [sellerForm, setSellerForm] = useState({
    sellerType: 'individual',
    businessName: '',
    productTypes: []
  })
  const [becomingSeller, setBecomingSeller] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [bidsRes, transactionsRes, adsRes] = await Promise.all([
        api.get('/bids/my-bids'),
        api.get('/transactions'),
        api.get('/ads?limit=4')
      ])
      setStats({
        myBids: bidsRes.data.data || bidsRes.data || [],
        transactions: transactionsRes.data.data || transactionsRes.data || []
      })
      setAvailableAds(adsRes.data.data || adsRes.data.ads || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
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

  const activeBids = stats.myBids.filter(b => ['bidding', 'inspection_phase', 'final_bidding'].includes(b.status))
  const wonDeals = stats.myBids.filter(b => b.isWinner)
  const activeDeal = stats.transactions.find(t => 
    t.buyerId?._id === JSON.parse(atob(localStorage.getItem('token')?.split('.')[1]))?.userId &&
    t.status !== 'completed'
  )

  const handleBecomeSeller = async (e) => {
    e.preventDefault()
    if (sellerForm.productTypes.length === 0) {
      toast.error('Select at least one product type')
      return
    }
    if (sellerForm.sellerType === 'business' && !sellerForm.businessName) {
      toast.error('Business name is required')
      return
    }

    setBecomingSeller(true)
    try {
      await becomeSeller(sellerForm)
      toast.success('You are now a seller!')
      setShowSellerModal(false)
      navigate('/seller/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to become seller')
    } finally {
      setBecomingSeller(false)
    }
  }

  const toggleProductType = (type) => {
    setSellerForm(prev => ({
      ...prev,
      productTypes: prev.productTypes.includes(type)
        ? prev.productTypes.filter(t => t !== type)
        : [...prev.productTypes, type]
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Active Bids</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeBids.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Won Deals</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{wonDeals.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-2">🤝</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Active Deal</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {activeDeal ? '1' : '0'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatPrice(stats.transactions.reduce((sum, t) => sum + (t.finalPrice || 0), 0))}
          </p>
        </div>
      </div>

      {user?.role === 'buyer' && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🏪
              </div>
              <div>
                <h3 className="font-semibold text-lg">Want to sell vehicles too?</h3>
                <p className="text-white/80 text-sm">Become a seller and start listing your vehicles</p>
              </div>
            </div>
            <button
              onClick={() => setShowSellerModal(true)}
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              Become a Seller
            </button>
          </div>
        </div>
      )}

      {activeDeal && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-2">Active Deal</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">{activeDeal.adId?.make} {activeDeal.adId?.model}</p>
              <p className="text-white/80">Final Price: {formatPrice(activeDeal.finalPrice)}</p>
            </div>
            <Link
              to="/buyer/active-deal"
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Available Ads</h2>
          <Link to="/buyer/available-ads" className="text-primary-600 hover:underline text-sm dark:text-primary-400">
            View All →
          </Link>
        </div>

        {availableAds.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No ads available at the moment</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableAds.map((ad) => (
              <Link key={ad._id} to={`/buyer/available-ads/${ad._id}`} className="group">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {ad.images?.[0] ? (
                    <img src={ad.images[0].url} alt={ad.model} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">🚗</div>
                  )}
                  <div className="p-3">
                    <p className="font-medium text-gray-800 dark:text-white">{ad.make} {ad.model}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ad.year} • {ad.kmDriven?.toLocaleString()} km</p>
                    <p className="text-primary-600 font-bold mt-1">{formatPrice(ad.askingPrice)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {activeBids.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Active Bids</h2>
            <Link to="/buyer/my-bids" className="text-primary-600 hover:underline text-sm dark:text-primary-400">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {activeBids.slice(0, 3).map((bid) => (
              <div key={bid._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {bid.images?.[0] && (
                    <img src={bid.images[0].url} alt={bid.model} className="w-12 h-10 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{bid.make} {bid.model}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your bid: {formatPrice(bid.initialBid?.amount)}
                      {bid.finalBid && <span className="text-primary-600"> → {formatPrice(bid.finalBid.amount)}</span>}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bid.isSelected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {bid.isSelected ? 'Selected for Inspection' : bid.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSellerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Become a Seller</h2>
              <button
                onClick={() => setShowSellerModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBecomeSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seller Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['individual', 'business', 'other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSellerForm({ ...sellerForm, sellerType: type })}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        sellerForm.sellerType === type
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {sellerForm.sellerType === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    value={sellerForm.businessName}
                    onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your business name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Products You Sell *</label>
                <div className="flex gap-4">
                  {['car', 'bike', 'commercial'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={sellerForm.productTypes.includes(type)}
                        onChange={() => toggleProductType(type)}
                        className="w-4 h-4 text-primary-600 rounded dark:bg-gray-700"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSellerModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={becomingSeller}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {becomingSeller ? 'Processing...' : 'Become Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerDashboard
