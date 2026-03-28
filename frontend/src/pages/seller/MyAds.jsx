import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const MyAds = () => {
  const { formatPrice } = useCurrency()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const { data } = await api.get('/ads/my-ads')
      setAds(data.data || data)
    } catch (error) {
      console.error('Failed to fetch ads')
    } finally {
      setLoading(false)
    }
  }

  const deleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    try {
      await api.delete(`/ads/${id}`)
      setAds(ads.filter(ad => ad._id !== id))
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete ad')
    }
  }

  const filteredAds = ads.filter(ad => {
    if (filter === 'all') return true
    if (filter === 'active') return !['completed', 'closed', 'draft'].includes(ad.status)
    return ad.status === filter
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Ads</h1>
        <Link
          to="/seller/post-ad"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Post New Ad
        </Link>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'draft', 'bidding', 'completed'].map((f) => (
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

      {filteredAds.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-800">No ads found</h3>
          <p className="text-gray-500 mt-2">Start by posting your first ad</p>
          <Link
            to="/seller/post-ad"
            className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Post Ad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div key={ad._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-48">
                {ad.images?.[0] ? (
                  <img src={ad.images[0].url} alt={ad.model} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                    🚗
                  </div>
                )}
                <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                  {getStatusLabel(ad.status)}
                </span>
                {ad.status === 'draft' && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Link
                      to={`/seller/post-ad/${ad._id}`}
                      className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => deleteAd(ad._id)}
                      className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800">
                  {ad.make} {ad.model}
                  {ad.variant && <span className="text-gray-500 font-normal"> {ad.variant}</span>}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {ad.year} • {ad.kmDriven?.toLocaleString()} km • {ad.fuelType}
                </p>
                <p className="text-xl font-bold text-primary-600 mt-2">
                  {formatPrice(ad.askingPrice)}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{ad.initialBids?.length || 0}</span> initial bids
                    {ad.finalBids?.length > 0 && (
                      <span className="ml-2 text-primary-600">
                        +{ad.finalBids.length} final
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/seller/my-ads/${ad._id}`}
                    className="text-primary-600 hover:underline text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAds
