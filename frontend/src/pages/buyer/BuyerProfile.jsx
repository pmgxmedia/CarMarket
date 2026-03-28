import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const BuyerProfile = () => {
  const { user, fetchProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    location: '',
    category: [],
    buyerType: 'individual',
    buyerDealerInfo: {
      registrationNumber: '',
      establishedYear: '',
      about: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      tradeLicenseNumber: '',
      vatNumber: ''
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
        location: user.location || '',
        category: user.category || [],
        buyerType: user.buyerType || 'individual',
        buyerDealerInfo: {
          registrationNumber: user.buyerDealerInfo?.registrationNumber || '',
          establishedYear: user.buyerDealerInfo?.establishedYear || '',
          about: user.buyerDealerInfo?.about || '',
          address: user.buyerDealerInfo?.address || '',
          city: user.buyerDealerInfo?.city || '',
          province: user.buyerDealerInfo?.province || '',
          postalCode: user.buyerDealerInfo?.postalCode || '',
          tradeLicenseNumber: user.buyerDealerInfo?.tradeLicenseNumber || '',
          vatNumber: user.buyerDealerInfo?.vatNumber || ''
        }
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('buyerDealerInfo.')) {
      const field = name.replace('buyerDealerInfo.', '')
      setFormData({
        ...formData,
        buyerDealerInfo: { ...formData.buyerDealerInfo, [field]: value }
      })
    } else if (name === 'category') {
      const checked = e.target.checked
      if (checked) {
        setFormData({ ...formData, category: [...formData.category, value] })
      } else {
        setFormData({ ...formData, category: formData.category.filter(c => c !== value) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/profile', formData)
      await fetchProfile()
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                maxLength={10}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="City/Town"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Buyer Type</h2>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="buyerType"
                value="individual"
                checked={formData.buyerType === 'individual'}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">Individual Buyer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="buyerType"
                value="dealer"
                checked={formData.buyerType === 'dealer'}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">Car Dealer</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories You're Interested In</h2>
          
          <div className="flex gap-6">
            {['car', 'bike', 'commercial'].map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="category"
                  value={cat}
                  checked={formData.category.includes(cat)}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="capitalize font-medium text-gray-900 dark:text-gray-100">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.buyerType === 'dealer' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dealership Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="buyerDealerInfo.registrationNumber"
                  value={formData.buyerDealerInfo.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="CK/2018/123456/23"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                <input
                  type="number"
                  name="buyerDealerInfo.establishedYear"
                  value={formData.buyerDealerInfo.establishedYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="2015"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trade License Number</label>
                <input
                  type="text"
                  name="buyerDealerInfo.tradeLicenseNumber"
                  value={formData.buyerDealerInfo.tradeLicenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                <input
                  type="text"
                  name="buyerDealerInfo.vatNumber"
                  value={formData.buyerDealerInfo.vatNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="VAT123456789"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About Your Business</label>
                <textarea
                  name="buyerDealerInfo.about"
                  value={formData.buyerDealerInfo.about}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell sellers about your business, what you specialize in, and your buying preferences..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="buyerDealerInfo.address"
                  value={formData.buyerDealerInfo.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="buyerDealerInfo.city"
                  value={formData.buyerDealerInfo.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  name="buyerDealerInfo.province"
                  value={formData.buyerDealerInfo.province}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Province</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="North West">North West</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="buyerDealerInfo.postalCode"
                  value={formData.buyerDealerInfo.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1234"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BuyerProfile
