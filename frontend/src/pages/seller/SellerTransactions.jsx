import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDate } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const SellerTransactions = () => {
  const { formatPrice } = useCurrency()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions')
      setTransactions((data.data || data).filter(t => t.sellerId?._id === JSON.parse(atob(localStorage.getItem('token')?.split('.')[1]))?.userId))
    } catch (error) {
      console.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('document', file)

      await api.post(`/transactions/${selectedTransaction._id}/document`, formData)

      alert('Document uploaded successfully!')
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-800">No transactions yet</h3>
          <p className="text-gray-500 mt-2">Your completed sales will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {transaction.adId?.images?.[0] && (
                    <img
                      src={transaction.adId.images[0].url}
                      alt={transaction.adId.model}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {transaction.adId?.make} {transaction.adId?.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sold to: {transaction.buyerId?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{formatPrice(transaction.finalPrice)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'document_pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.status === 'completed' ? 'Completed' :
                     transaction.status === 'document_pending' ? 'Upload Document' :
                     transaction.status === 'photo_pending' ? 'Awaiting Photo' : 'Pending'}
                  </span>
                </div>
              </div>

              {transaction.status !== 'completed' && (
                <div className="mt-4 pt-4 border-t">
                  {transaction.saleDocument ? (
                    <p className="text-sm text-green-600">✓ Sale document uploaded</p>
                  ) : (
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Upload Sale Document
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Sale Document</h3>
            <p className="text-gray-600 mb-4">
              Please upload the sale documents (RC book, NOC, etc.) for {selectedTransaction.adId?.make} {selectedTransaction.adId?.model}
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUploadDocument}
              className="w-full p-3 border rounded-lg"
              disabled={uploading}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerTransactions
