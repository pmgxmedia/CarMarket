import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useCurrency } from '../../context/CurrencyContext'

const PublicMarketplace = () => {
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchAds()
  }, [filters, page])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      params.append('page', page)
      params.append('limit', 12)

      const { data } = await api.get(`/ads?${params.toString()}`)
      setAds(data.data || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch ads')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      <nav className="px-4 md:px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-xl font-bold text-white">
          CarMarket
        </button>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-3 md:px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm md:text-base"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 md:px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base"
          >
            Register
          </Link>
        </div>
      </nav>

      <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Explore Marketplace</h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Browse vehicles from registered sellers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            >
              <option value="">All Categories</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="commercial">Commercial</option>
            </select>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Location"
              className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            />
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price"
              className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price"
              className="px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md:text-base"
            />
            <button
              onClick={() => {
                setFilters({ category: '', location: '', minPrice: '', maxPrice: '' })
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm md:text-base"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">No ads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {ads.map((ad) => (
                <div key={ad._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="relative h-40 md:h-48">
                    {ad.images?.[0] ? (
                      <img
                        src={ad.images[0].url}
                        alt={ad.model}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl">
                        🚗
                      </div>
                    )}
                    <span className="absolute top-2 md:top-3 left-2 md:left-3 px-2 py-1 bg-white/90 dark:bg-black/60 rounded-full text-xs font-medium capitalize text-gray-800 dark:text-white">
                      {ad.category}
                    </span>
                    <span className="absolute top-2 md:top-3 right-2 md:right-3 px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                      {ad.initialBids?.length || 0} bids
                    </span>
                  </div>

                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">
                      {ad.make} {ad.model}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {ad.year} • {ad.kmDriven?.toLocaleString()} km • <span className="capitalize">{ad.fuelType}</span>
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{ad.location}</p>
                    <p className="text-base md:text-xl font-bold text-primary-600 mt-2 dark:text-primary-400">
                      {formatPrice(ad.askingPrice)}
                    </p>
                    <Link
                      to="/register"
                      className="mt-3 block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base"
                    >
                      Register to Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-white/30 rounded-lg disabled:opacity-50 hover:bg-white/10 text-white text-sm md:text-base"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white/80 text-sm md:text-base">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-white/30 rounded-lg disabled:opacity-50 hover:bg-white/10 text-white text-sm md:text-base"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm md:text-base">Ready to start bidding?</p>
          <Link
            to="/register"
            className="inline-block mt-3 px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm md:text-base"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PublicMarketplace
