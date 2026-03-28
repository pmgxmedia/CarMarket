import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDate, getStatusLabel } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const AdminTransactions = () => {
  const { formatPrice } = useCurrency()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [statusFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const { data } = await api.get(`/admin/transactions?${params.toString()}`)
      setTransactions(data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      document_pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      photo_pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Transactions</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${!statusFilter ? 'bg-primary-600 dark:bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          All
        </button>
        {['pending', 'document_pending', 'photo_pending', 'completed'].map((status) => (
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
      ) : transactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-white">No transactions found</h3>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {transaction.adId?.images?.[0] && (
                    <img
                      src={transaction.adId.images[0].url}
                      alt={transaction.adId.model}
                      className="w-16 h-12 md:w-20 md:h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base truncate">
                      {transaction.adId?.make} {transaction.adId?.model}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {transaction.adId?.year} • {transaction.adId?.kmDriven?.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg md:text-xl font-bold text-green-600">{formatPrice(transaction.finalPrice)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Seller</p>
                  <p className="font-medium text-gray-800 dark:text-white text-xs md:text-base truncate">{transaction.sellerId?.name}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Buyer</p>
                  <p className="font-medium text-gray-800 dark:text-white text-xs md:text-base truncate">{transaction.buyerId?.name}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-800 dark:text-white text-xs md:text-base">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4 mt-3 md:mt-4">
                <div className={`p-2 md:p-3 rounded-lg text-xs md:text-sm ${transaction.saleDocument ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <p className="text-gray-500 dark:text-gray-400">Sale Document</p>
                  <p className={transaction.saleDocument ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                    {transaction.saleDocument ? '✓ Uploaded' : 'Pending'}
                  </p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg text-xs md:text-sm ${transaction.deliveryPhoto ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <p className="text-gray-500 dark:text-gray-400">Delivery Photo</p>
                  <p className={transaction.deliveryPhoto ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                    {transaction.deliveryPhoto ? '✓ Uploaded' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminTransactions
