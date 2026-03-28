import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const AdDetails = () => {
  const { formatPrice } = useCurrency()
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
      const { data } = await api.get(`/ads/${id}`)
      setAd(data)
      setBidAmount(data.askingPrice)
    } catch (error) {
      toast.error('Failed to load ad')
      navigate('/buyer/available-ads')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = async () => {
    if (!bidAmount || bidAmount < 500) {
      toast.error('Minimum bid is ₹500')
      return
    }

    setPlacingBid(true)
    try {
      await api.post(`/bids/${id}/bid`, {
        amount: Number(bidAmount),
        message: bidMessage
      })
      toast.success('Bid placed successfully!')
      fetchAd()
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

  const myBid = ad.initialBids?.find(b => b.buyerId._id === ad.currentUserId)

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/buyer/available-ads')} className="text-gray-500 hover:text-gray-700">
        ← Back to Ads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-96">
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
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">
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
                  className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-opacity ${
                    currentImageIndex === idx ? 'opacity-100 ring-2 ring-primary-500' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {ad.make} {ad.model}
                </h1>
                {ad.variant && <p className="text-lg text-gray-500">{ad.variant}</p>}
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                {ad.category}
              </span>
            </div>

            <p className="text-3xl font-bold text-primary-600 mt-4">
              {formatPrice(ad.askingPrice)}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📅</span>
                <span>{ad.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📏</span>
                <span>{ad.kmDriven?.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⛽</span>
                <span className="capitalize">{ad.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⚙️</span>
                <span className="capitalize">{ad.transmission}</span>
              </div>
              {ad.color && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🎨</span>
                  <span>{ad.color}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📍</span>
                <span>{ad.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{ad.description}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                {ad.sellerId?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{ad.sellerId?.name}</p>
                {ad.sellerId?.businessName && (
                  <p className="text-sm text-gray-500">{ad.sellerId.businessName}</p>
                )}
                <p className="text-sm text-gray-500">{ad.sellerId?.location}</p>
              </div>
            </div>
          </div>

          {ad.status === 'bidding' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Place Your Bid</h3>
              
              {myBid ? (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ You have already placed a bid</p>
                  <p className="text-green-700 mt-1">Your bid: {formatPrice(myBid.amount)}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Bid Amount (₹)</label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={500}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                      <textarea
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        placeholder="Add a message to the seller..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
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
                </>
              )}
            </div>
          )}

          {['inspection_phase', 'final_bidding'].includes(ad.status) && (
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-orange-800 mb-2">Bidding Stage</h3>
              <p className="text-orange-700">
                {ad.status === 'inspection_phase'
                  ? 'The seller is waiting for inspection confirmations. Final bidding will begin after inspections.'
                  : 'Final bidding is open! Submit your best offer after inspection.'}
              </p>
              {ad.finalBids?.find(b => b.buyerId._id === ad.currentUserId) ? (
                <p className="text-green-700 font-medium mt-2">
                  ✓ Your final bid: {formatPrice(ad.finalBids.find(b => b.buyerId._id === ad.currentUserId)?.amount)}
                </p>
              ) : ad.status === 'final_bidding' ? (
                <button
                  onClick={() => navigate(`/buyer/available-ads/${id}/bid`)}
                  className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Place Final Bid
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdDetails
