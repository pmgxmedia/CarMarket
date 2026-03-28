import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'

const MarketplaceDetails = () => {
  const { formatPrice } = useCurrency()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [placingBid, setPlacingBid] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchAd()
  }, [id])

  const fetchAd = async () => {
    try {
      const { data } = await api.get(`/ads/${id}?fields=detailed`)
      setAd(data)
      setBidAmount(data.askingPrice)
    } catch (error) {
      toast.error('Failed to load ad')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = async () => {
    if (!user) {
      navigate('/register', { state: { from: `/seller/marketplace/${id}` } })
      return
    }

    if (!bidAmount || bidAmount < 1000) {
      toast.error('Minimum bid is R1,000')
      return
    }

    setPlacingBid(true)
    try {
      await api.post(`/bids/${id}/initial-bid`, {
        amount: Number(bidAmount),
        message: bidMessage
      })
      toast.success('Bid placed successfully!')
      fetchAd()
      setBidMessage('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place bid')
    } finally {
      setPlacingBid(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!ad) return null

  const userHasBid = ad.initialBids?.some(b => b.buyerId?._id === user?._id)

  return (
    <div className="space-y-4 md:space-y-6">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-64 md:h-96">
            {ad.images?.length > 0 ? (
              <>
                <img
                  src={ad.images[currentImageIndex].url}
                  alt={`${ad.make} ${ad.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {ad.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentImageIndex === idx ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-6xl">
                🚗
              </div>
            )}
          </div>
          {ad.images?.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {ad.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${ad.make} ${ad.model} ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-12 md:w-20 md:h-16 object-cover rounded-lg cursor-pointer transition-opacity ${
                    currentImageIndex === idx ? 'opacity-100 ring-2 ring-primary-500' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  {ad.make} {ad.model}
                </h1>
                {ad.variant && <p className="text-sm md:text-lg text-gray-500">{ad.variant}</p>}
              </div>
              <span className="px-2 md:px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full text-xs md:text-sm font-medium capitalize">
                {ad.category}
              </span>
            </div>

            <p className="text-xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(ad.askingPrice)}
              {ad.negotiable && <span className="text-sm font-normal text-gray-500 ml-2">(Negotiable)</span>}
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-gray-400">📅</span>
                <span className="text-gray-700 dark:text-gray-300">{ad.year}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-gray-400">📏</span>
                <span className="text-gray-700 dark:text-gray-300">{ad.kmDriven?.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-gray-400">⛽</span>
                <span className="text-gray-700 dark:text-gray-300 capitalize">{ad.fuelType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-gray-400">⚙️</span>
                <span className="text-gray-700 dark:text-gray-300 capitalize">{ad.transmission}</span>
              </div>
              {ad.bodyType && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="text-gray-400">🚗</span>
                  <span className="text-gray-700 dark:text-gray-300">{ad.bodyType}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-gray-400">📍</span>
                <span className="text-gray-700 dark:text-gray-300">{ad.location}, {ad.province}</span>
              </div>
            </div>

            {ad.features?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {ad.features.map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Description</h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 whitespace-pre-line">{ad.description}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-lg">
                {ad.sellerId?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{ad.sellerId?.name}</p>
                {ad.sellerId?.businessName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ad.sellerId.businessName}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">{ad.sellerId?.location}</p>
              </div>
            </div>
          </div>

          {ad.status === 'bidding' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Place Your Bid</h3>
              
              {userHasBid ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-medium">✓ You have already placed a bid</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">Check your bids in "My Bids" section</p>
                </div>
              ) : user?._id === ad.sellerId?._id ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-300">This is your listing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Bid Amount (R)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={1000}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (Optional)</label>
                    <textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Add a message to the seller..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={handlePlaceBid}
                    disabled={placingBid}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                  >
                    {placingBid ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Status:</strong> {ad.status}</p>
            <p><strong>Bidding ends:</strong> {ad.bidEndDate ? new Date(ad.bidEndDate).toLocaleDateString('en-ZA') : 'N/A'}</p>
            <p><strong>Current bids:</strong> {ad.initialBids?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceDetails
