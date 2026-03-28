import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const ActiveDeal = () => {
  const { formatPrice } = useCurrency()
  const [transaction, setTransaction] = useState(null)
  const [sellerPayment, setSellerPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchActiveDeal()
  }, [])

  const fetchActiveDeal = async () => {
    try {
      const { data } = await api.get('/transactions')
      const transactions = data.data || data
      const active = transactions.find(t => t.status !== 'completed')
      setTransaction(active || null)
      
      if (active?.sellerId?._id) {
        const sellerRes = await api.get(`/auth/profile/${active.sellerId._id}`)
        setSellerPayment({
          paymentMethod: sellerRes.data.paymentMethod,
          bankDetails: sellerRes.data.bankDetails
        })
      }
    } catch (error) {
      console.error('Failed to fetch deal')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      await api.post(`/transactions/${transaction._id}/delivery-photo`, formData)

      toast.success('Delivery photo uploaded! Transaction completed.')
      fetchActiveDeal()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload photo')
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

  if (!transaction) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Active Deal</h1>
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-lg font-medium text-gray-800">No active deal</h3>
          <p className="text-gray-500 mt-2">Win a bid to start a deal</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Active Deal</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          {transaction.adId?.images?.[0] && (
            <img
              src={transaction.adId.images[0].url}
              alt={transaction.adId.model}
              className="w-48 h-36 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {transaction.adId?.make} {transaction.adId?.model}
            </h2>
            <p className="text-gray-500">
              {transaction.adId?.year} • {transaction.adId?.kmDriven?.toLocaleString()} km
            </p>
            <p className="text-3xl font-bold text-primary-600 mt-3">
              {formatPrice(transaction.finalPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Important Dates</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Payment Deadline</span>
              <span className="font-medium">{formatDate(transaction.adId?.paymentDeadline)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Pickup Date</span>
              <span className="font-medium">{formatDate(transaction.adId?.pickupDate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Seller Information</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
              {transaction.sellerId?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{transaction.sellerId?.name}</p>
              <p className="text-sm text-gray-500">{transaction.sellerId?.location}</p>
              <p className="text-sm text-gray-500">{transaction.sellerId?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {sellerPayment && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>
          <p className="text-sm text-gray-500 mb-4">Use these details to transfer the payment to the seller.</p>
          
          {sellerPayment.paymentMethod === 'bank_transfer' && sellerPayment.bankDetails && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Bank Transfer Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Account Holder</p>
                  <p className="font-medium">{sellerPayment.bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p className="font-medium">{sellerPayment.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p className="font-medium">{sellerPayment.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">IFSC Code</p>
                  <p className="font-medium">{sellerPayment.bankDetails.ifscCode}</p>
                </div>
              </div>
            </div>
          )}

          {sellerPayment.paymentMethod === 'upi' && sellerPayment.bankDetails && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">UPI Payment</h4>
              <div>
                <p className="text-gray-500">UPI ID</p>
                <p className="font-medium text-xl">{sellerPayment.bankDetails.upiId}</p>
              </div>
            </div>
          )}

          {sellerPayment.paymentMethod === 'cash' && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Cash Payment</h4>
              <p className="text-sm text-yellow-700">
                Please pay in cash when you collect the vehicle from the seller.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Documents & Photos</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Sale Document (from Seller)</p>
              {transaction.saleDocument ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-600">✓ Uploaded</span>
                  <span className="text-gray-500 text-sm">
                    on {formatDate(transaction.saleDocument.uploadedAt)}
                  </span>
                </div>
              ) : (
                <p className="text-yellow-600 text-sm mt-1">Awaiting seller upload</p>
              )}
            </div>
            {transaction.saleDocument && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Received
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Delivery Photo (Your Upload)</p>
              {transaction.deliveryPhoto ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-600">✓ Uploaded</span>
                  <span className="text-gray-500 text-sm">
                    on {formatDate(transaction.deliveryPhoto.uploadedAt)}
                  </span>
                </div>
              ) : (
                <p className="text-blue-600 text-sm mt-1">
                  Upload a photo of the vehicle when you receive it
                </p>
              )}
            </div>
            {!transaction.deliveryPhoto && transaction.saleDocument && (
              <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            {transaction.deliveryPhoto && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Uploaded
              </span>
            )}
          </div>
        </div>

        {transaction.status === 'completed' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-green-800">Transaction Completed!</h3>
            <p className="text-green-700 mt-1">Congratulations on your purchase.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
        <ol className="text-blue-700 space-y-2 text-sm">
          <li>1. Make payment to the seller as per the deadline</li>
          <li>2. Coordinate with the seller for vehicle pickup</li>
          <li>3. On receiving the vehicle, upload a delivery photo</li>
          <li>4. Once the seller uploads the sale documents and you upload delivery photo, the transaction is complete!</li>
        </ol>
      </div>
    </div>
  )
}

export default ActiveDeal
