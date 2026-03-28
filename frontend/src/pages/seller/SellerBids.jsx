import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useCurrency } from '../../context/CurrencyContext'
import { formatDate } from '../../utils/helpers'

const SellerBids = () => {
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [confirming, setConfirming] = useState(null)
  const [finalBidModal, setFinalBidModal] = useState(null)
  const [finalBidAmount, setFinalBidAmount] = useState('')
  const [finalBidMessage, setFinalBidMessage] = useState('')

  useEffect(() => {
    fetchBids()
  }, [activeTab])

  const fetchBids = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/bids/my-bids')
      const bidsData = data.data || data || []
      setBids(bidsData)
    } catch (error) {
      console.error('Failed to fetch bids')
    } finally {
      setLoading(false)
    }
  }

  const confirmInspection = async (adId) => {
    setConfirming(adId)
    try {
      const { data } = await api.post(`/bids/${adId}/confirm-inspection`)
      toast.success(data.message || 'Inspection confirmed!')
      fetchBids()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to confirm inspection')
    } finally {
      setConfirming(null)
    }
  }

  const submitFinalBid = async (adId) => {
    if (!finalBidAmount || finalBidAmount < 1000) {
      toast.error('Minimum bid is R1,000')
      return
    }

    try {
      await api.post(`/bids/${adId}/final-bid`, {
        amount: Number(finalBidAmount),
        message: finalBidMessage
      })
      toast.success('Final bid submitted successfully!')
      setFinalBidModal(null)
      setFinalBidAmount('')
      setFinalBidMessage('')
      fetchBids()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit final bid')
    }
  }

  const activeBids = bids.filter(b => !['completed', 'closed', 'won'].includes(b.statusLabel))
  const pastBids = bids.filter(b => ['completed', 'closed', 'won'].includes(b.statusLabel))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/seller/dashboard')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">My Bids</h1>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'active'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Active Bids ({activeBids.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'past'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Past Bids ({pastBids.length})
          </button>
        </nav>
      </div>

      {activeTab === 'active' && (
        activeBids.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">No active bids</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
              Browse the marketplace to place bids on vehicles
            </p>
            <Link
              to="/seller/marketplace"
              className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm md:text-base"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBids.map((bid) => (
              <div key={bid._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {bid.images?.[0] && (
                      <img
                        src={bid.images[0].url}
                        alt={bid.model}
                        className="w-16 h-12 md:w-20 md:h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base truncate">
                        {bid.make} {bid.model}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {bid.year} • {bid.location}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Asking: {formatPrice(bid.askingPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your Bid</p>
                      <p className="text-lg md:text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(bid.initialBid?.amount)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bid.statusLabel === 'bidding' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      bid.statusLabel === 'inspection_phase' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      bid.statusLabel === 'final_bidding' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {bid.statusLabel === 'bidding' ? 'Bidding' : 
                       bid.statusLabel === 'inspection_phase' ? 'Inspection Phase' :
                       bid.statusLabel === 'final_bidding' ? 'Final Bidding' :
                       bid.status}
                    </span>
                  </div>
                </div>

                {bid.initialBid?.message && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Your message: {bid.initialBid.message}</p>
                )}

                {bid.isSelected && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      ✓ You've been selected for inspection!
                    </p>
                    {bid.inspectionDateStart && bid.inspectionDateEnd && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Inspection: {formatDate(bid.inspectionDateStart)} - {formatDate(bid.inspectionDateEnd)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
                  <Link
                    to={`/seller/marketplace/${bid._id}`}
                    className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                  >
                    View Ad
                  </Link>

                  <div className="flex gap-2">
                    {bid.isSelected && !bid.hasConfirmed && bid.statusLabel === 'inspection_phase' && (
                      <button
                        onClick={() => confirmInspection(bid._id)}
                        disabled={confirming === bid._id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {confirming === bid._id ? 'Confirming...' : '✓ Confirm Inspection'}
                      </button>
                    )}

                    {bid.hasConfirmed && bid.statusLabel === 'inspection_phase' && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm font-medium">
                        ✓ Inspection Confirmed
                      </span>
                    )}

                    {bid.statusLabel === 'final_bidding' && (
                      <button
                        onClick={() => {
                          setFinalBidModal(bid)
                          setFinalBidAmount(bid.initialBid?.amount || bid.askingPrice)
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        Place Final Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'past' && (
        pastBids.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">No past bids</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {pastBids.map((bid) => (
              <div key={bid._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 opacity-75">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {bid.images?.[0] && (
                      <img
                        src={bid.images[0].url}
                        alt={bid.model}
                        className="w-16 h-12 md:w-20 md:h-16 object-cover rounded-lg grayscale"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base truncate">
                        {bid.make} {bid.model}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {bid.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your Bid</p>
                      <p className="font-bold text-gray-600 dark:text-gray-300">
                        {formatPrice(bid.finalBid?.amount || bid.initialBid?.amount)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bid.statusLabel === 'won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      bid.statusLabel === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {bid.statusLabel === 'won' ? 'Won!' : 
                       bid.statusLabel === 'completed' ? 'Completed' : 
                       bid.statusLabel === 'closed' ? 'Closed' : 'Lost'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {finalBidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Place Final Bid
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {finalBidModal.make} {finalBidModal.model}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Final Bid Amount (R)
                </label>
                <input
                  type="number"
                  value={finalBidAmount}
                  onChange={(e) => setFinalBidAmount(e.target.value)}
                  min={1000}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={finalBidMessage}
                  onChange={(e) => setFinalBidMessage(e.target.value)}
                  placeholder="Final message to the seller..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setFinalBidModal(null)
                  setFinalBidAmount('')
                  setFinalBidMessage('')
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => submitFinalBid(finalBidModal._id)}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Submit Final Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerBids
