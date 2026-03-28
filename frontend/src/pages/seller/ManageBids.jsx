import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const ManageBids = () => {
  const { formatPrice } = useCurrency()
  const { id } = useParams()
  const navigate = useNavigate()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [finalBidding, setFinalBidding] = useState(false)
  const [winnerModal, setWinnerModal] = useState(false)
  const [selectedBuyers, setSelectedBuyers] = useState([])
  const [inspectionDates, setInspectionDates] = useState({ start: '', end: '' })
  const [winner, setWinner] = useState(null)
  const [pickupDate, setPickupDate] = useState('')
  const [paymentDeadline, setPaymentDeadline] = useState('')

  useEffect(() => {
    fetchAd()
  }, [id])

  const fetchAd = async () => {
    try {
      const { data } = await api.get(`/ads/${id}`)
      setAd(data)
      setSelectedBuyers(data.selectedBuyers?.map(b => b._id) || [])
    } catch (error) {
      toast.error('Failed to load ad')
      navigate('/seller/my-ads')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBuyers = async () => {
    if (selectedBuyers.length === 0) {
      toast.error('Select at least one buyer')
      return
    }
    if (!inspectionDates.start || !inspectionDates.end) {
      toast.error('Select inspection date range')
      return
    }

    setSelecting(true)
    try {
      const { data } = await api.post(`/bids/${id}/select`, {
        buyerIds: selectedBuyers,
        inspectionDateStart: inspectionDates.start,
        inspectionDateEnd: inspectionDates.end
      })
      toast.success('Buyers selected for inspection!')
      fetchAd()
      setFinalBidding(true)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to select buyers')
    } finally {
      setSelecting(false)
    }
  }

  const handleSelectWinner = async () => {
    if (!winner) {
      toast.error('Select a winner')
      return
    }
    if (!pickupDate || !paymentDeadline) {
      toast.error('Set pickup and payment deadlines')
      return
    }

    setSelecting(true)
    try {
      await api.post(`/bids/${id}/winner`, {
        buyerId: winner,
        pickupDate,
        paymentDeadline
      })
      toast.success('Winner selected! Buyer has been notified.')
      fetchAd()
      setWinnerModal(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to select winner')
    } finally {
      setSelecting(false)
    }
  }

  const toggleBuyer = (buyerId) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId)
        ? prev.filter(id => id !== buyerId)
        : prev.length < 5
          ? [...prev, buyerId]
          : prev
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!ad) return null

  const sortedInitialBids = [...(ad.initialBids || [])].sort((a, b) => b.amount - a.amount)
  const sortedFinalBids = [...(ad.finalBids || [])].sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/seller/my-ads')} className="text-gray-500 hover:text-gray-700">
        ← Back to My Ads
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          {ad.images?.[0] && (
            <img src={ad.images[0].url} alt={ad.model} className="w-48 h-32 object-cover rounded-lg" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {ad.make} {ad.model}
                  {ad.variant && <span className="text-gray-500 font-normal"> {ad.variant}</span>}
                </h1>
                <p className="text-gray-500 mt-1">
                  {ad.year} • {ad.kmDriven?.toLocaleString()} km • {ad.fuelType} • {ad.transmission}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.status)}`}>
                {getStatusLabel(ad.status)}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary-600 mt-3">
              Asking: {formatPrice(ad.askingPrice)}
            </p>
          </div>
        </div>
      </div>

      {ad.status === 'bidding' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Initial Bids ({sortedInitialBids.length})
          </h2>

          {sortedInitialBids.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bids yet. Share your ad with buyers!</p>
          ) : (
            <div className="space-y-3">
              {sortedInitialBids.map((bid, index) => (
                <div
                  key={bid._id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    selectedBuyers.includes(bid.buyerId._id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {bid.buyerId.name}
                        {bid.buyerId.businessName && (
                          <span className="text-gray-500"> ({bid.buyerId.businessName})</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {bid.buyerId.buyerType} • {bid.buyerId.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">{formatPrice(bid.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDate(bid.createdAt)}</p>
                    </div>
                    {index < 5 && (
                      <button
                        onClick={() => toggleBuyer(bid.buyerId._id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedBuyers.includes(bid.buyerId._id)
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {selectedBuyers.includes(bid.buyerId._id) ? 'Selected' : 'Select'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedBuyers.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Select Inspection Dates</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={inspectionDates.start}
                    onChange={(e) => setInspectionDates({ ...inspectionDates, start: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={inspectionDates.end}
                    onChange={(e) => setInspectionDates({ ...inspectionDates, end: e.target.value })}
                    min={inspectionDates.start || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleSelectBuyers}
                disabled={selecting}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {selecting ? 'Processing...' : `Send Invitation to ${selectedBuyers.length} Buyers`}
              </button>
            </div>
          )}
        </div>
      )}

      {(ad.status === 'inspection_phase' || ad.status === 'final_bidding') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Final Bids</h2>
            {ad.status === 'inspection_phase' && ad.finalBids?.length > 0 && (
              <span className="text-sm text-gray-500">Waiting for more final bids...</span>
            )}
          </div>

          {ad.inspectionDateStart && ad.inspectionDateEnd && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Inspection Dates:</strong> {formatDate(ad.inspectionDateStart)} - {formatDate(ad.inspectionDateEnd)}
              </p>
            </div>
          )}

          {sortedFinalBids.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Waiting for buyers to submit final bids after inspection.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedFinalBids.map((bid, index) => (
                <div key={bid._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{bid.buyerId.name}</p>
                      <p className="text-sm text-gray-500">{bid.buyerId.buyerType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-green-600">{formatPrice(bid.amount)}</p>
                    <button
                      onClick={() => {
                        setWinner(bid.buyerId._id)
                        setWinnerModal(true)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Select Winner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {ad.status === 'winner_selected' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Winner Selected</h2>
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-green-800 font-medium">Congratulations! You have selected the winner.</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Final Price</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(ad.finalPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup Date</p>
                <p className="font-medium">{formatDate(ad.pickupDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {winnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Winner Selection</h3>
            <p className="text-gray-600 mb-4">
              Once confirmed, the buyer will be notified to make payment. Set the deadlines below:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Deadline</label>
                <input
                  type="date"
                  value={paymentDeadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={paymentDeadline || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setWinnerModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectWinner}
                disabled={selecting}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {selecting ? 'Confirming...' : 'Confirm Winner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBids
