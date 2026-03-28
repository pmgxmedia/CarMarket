import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDate, getStatusLabel } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const AdminAds = () => {
  const { formatPrice } = useCurrency()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAds()
  }, [statusFilter, page])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('page', page)

      const { data } = await api.get(`/admin/ads?${params.toString()}`)
      setAds(data.data || [])
    } catch (error) {
      console.error('Failed to fetch ads')
    } finally {
      setLoading(false)
    }
  }

  const deleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    try {
      await api.delete(`/admin/ads/${id}`)
      setAds(ads.filter(a => a._id !== id))
    } catch (error) {
      alert('Failed to delete ad')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      bidding: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      inspection_phase: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Ads</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${!statusFilter ? 'bg-primary-600 dark:bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          All
        </button>
        {['draft', 'bidding', 'inspection_phase', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${statusFilter === status ? 'bg-primary-600 dark:bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ads.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ad.images?.[0] && (
                          <img src={ad.images[0].url} alt={ad.model} className="w-12 h-10 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{ad.make} {ad.model}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{ad.year} • {ad.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{formatPrice(ad.askingPrice)}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 dark:text-white">{ad.sellerId?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ad.sellerId?.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {getStatusLabel(ad.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(ad.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteAd(ad._id)}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {ads.map((ad) => (
              <div key={ad._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex gap-3 mb-3">
                  {ad.images?.[0] && (
                    <img src={ad.images[0].url} alt={ad.model} className="w-20 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{ad.make} {ad.model}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ad.year} • {ad.category}</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">{formatPrice(ad.askingPrice)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Seller</p>
                    <p className="text-gray-800 dark:text-white">{ad.sellerId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Location</p>
                    <p className="text-gray-800 dark:text-white">{ad.sellerId?.location || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                    {getStatusLabel(ad.status)}
                  </span>
                  <button
                    onClick={() => deleteAd(ad._id)}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminAds
