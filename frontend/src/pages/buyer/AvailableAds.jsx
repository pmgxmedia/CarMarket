import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useCurrency } from '../../context/CurrencyContext'

const AvailableAds = () => {
  const { formatPrice } = useCurrency()
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Available Ads</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min Price"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max Price"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => {
              setFilters({ category: '', location: '', minPrice: '', maxPrice: '' })
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">No ads found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <Link key={ad._id} to={`/buyer/available-ads/${ad._id}`} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="relative h-48">
                    {ad.images?.[0] ? (
                      <img
                        src={ad.images[0].url}
                        alt={ad.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl">
                        🚗
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/60 rounded-full text-xs font-medium capitalize text-gray-800 dark:text-white">
                      {ad.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                      {ad.initialBids?.length || 0} bids
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {ad.make} {ad.model}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {ad.year} • {ad.kmDriven?.toLocaleString()} km • {ad.fuelType}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ad.location}</p>
                    <p className="text-xl font-bold text-primary-600 mt-2">
                      {formatPrice(ad.askingPrice)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-200">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AvailableAds
