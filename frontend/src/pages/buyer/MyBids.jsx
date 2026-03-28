import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatDate } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const MyBids = () => {
  const { formatPrice } = useCurrency()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBids()
  }, [])

  const fetchBids = async () => {
    try {
      const { data } = await api.get('/bids/my-bids')
      setBids(data.data || data)
    } catch (error) {
      console.error('Failed to fetch bids')
    } finally {
      setLoading(false)
    }
  }

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true
    if (filter === 'active') return ['bidding', 'inspection_phase', 'final_bidding'].includes(bid.status)
    if (filter === 'won') return bid.isWinner
    if (filter === 'lost') return !bid.isSelected && !bid.isWinner && bid.status === 'completed'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Bids</h1>

      <div className="flex gap-2">
        {['all', 'active', 'won', 'lost'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredBids.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-800">No bids found</h3>
          <p className="text-gray-500 mt-2">Start bidding on available ads</p>
          <Link
            to="/buyer/available-ads"
            className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Browse Ads
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => (
            <div key={bid._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-6">
                {bid.images?.[0] && (
                  <img
                    src={bid.images[0].url}
                    alt={bid.model}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/buyer/available-ads/${bid._id}`} className="font-semibold text-gray-800 hover:text-primary-600">
                        {bid.make} {bid.model}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {bid.year} • {bid.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bid.isWinner
                        ? 'bg-green-100 text-green-800'
                        : bid.isSelected
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bid.isWinner ? 'Won' : bid.isSelected ? 'Selected for Inspection' : bid.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Initial Bid</p>
                      <p className="font-semibold">{formatPrice(bid.initialBid?.amount)}</p>
                    </div>
                    {bid.finalBid && (
                      <div>
                        <p className="text-sm text-gray-500">Final Bid</p>
                        <p className="font-semibold text-green-600">{formatPrice(bid.finalBid.amount)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Asking Price</p>
                      <p className="font-semibold">{formatPrice(bid.askingPrice)}</p>
                    </div>
                  </div>

                  {bid.isWinner && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">
                        Congratulations! You won this auction.
                      </p>
                      <Link
                        to="/buyer/active-deal"
                        className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        View Deal Details
                      </Link>
                    </div>
                  )}

                  {bid.isSelected && !bid.isWinner && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        You've been selected for inspection! Please coordinate with the seller.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBids
