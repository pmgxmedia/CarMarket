import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PaymentSettings = () => {
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    cvcCode: '',
    upiId: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const { data } = await api.get('/auth/payment-settings')
      setPaymentMethod(data.paymentMethod || 'bank_transfer')
      setBankDetails(data.bankDetails || {
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        cvcCode: '',
        upiId: ''
      })
    } catch (error) {
      console.error('Failed to fetch payment settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (paymentMethod === 'bank_transfer') {
      if (!bankDetails.accountHolderName || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.cvcCode) {
        toast.error('Please fill all bank details')
        return
      }
    }

    setSaving(true)
    try {
      await api.put('/auth/payment-settings', { paymentMethod, bankDetails })
      toast.success('Payment settings saved successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save payment settings')
    } finally {
      setSaving(false)
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
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Preferred Payment Method</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === 'bank_transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-primary-600"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Bank Transfer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive payment directly to your bank account</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-primary-600"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">UPI</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive payment via UPI (Google Pay, PhonePe, etc.)</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 text-primary-600"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Cash</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive payment in cash during vehicle handover</p>
            </div>
          </label>
        </div>
      </div>

      {paymentMethod === 'bank_transfer' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Bank Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">These details will be shared with the winning bidder to transfer payment.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name *</label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name *</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="ABSA Bank"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number *</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="123456789012"
                maxLength={18}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC/CVV Code *</label>
              <input
                type="text"
                value={bankDetails.cvcCode}
                onChange={(e) => setBankDetails({ ...bankDetails, cvcCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">UPI Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter your UPI ID for receiving payments.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UPI ID *</label>
            <input
              type="text"
              value={bankDetails.upiId}
              onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="yourname@upi"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
      >
        {saving ? 'Saving...' : 'Save Payment Settings'}
      </button>
    </div>
  )
}

export default PaymentSettings
