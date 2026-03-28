import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const SellerProfile = () => {
  const { user, fetchProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    location: '',
    productTypes: [],
    sellerType: 'individual',
    dealerInfo: {
      registrationNumber: '',
      establishedYear: '',
      about: '',
      website: '',
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
        productTypes: user.productTypes || [],
        sellerType: user.sellerType || 'individual',
        dealerInfo: {
          registrationNumber: user.dealerInfo?.registrationNumber || '',
          establishedYear: user.dealerInfo?.establishedYear || '',
          about: user.dealerInfo?.about || '',
          website: user.dealerInfo?.website || '',
          address: user.dealerInfo?.address || '',
          city: user.dealerInfo?.city || '',
          province: user.dealerInfo?.province || '',
          postalCode: user.dealerInfo?.postalCode || '',
          tradeLicenseNumber: user.dealerInfo?.tradeLicenseNumber || '',
          vatNumber: user.dealerInfo?.vatNumber || ''
        }
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('dealerInfo.')) {
      const field = name.replace('dealerInfo.', '')
      setFormData({
        ...formData,
        dealerInfo: { ...formData.dealerInfo, [field]: value }
      })
    } else if (name === 'productTypes') {
      const checked = e.target.checked
      const value = e.target.value
      if (checked) {
        setFormData({ ...formData, productTypes: [...formData.productTypes, value] })
      } else {
        setFormData({ ...formData, productTypes: formData.productTypes.filter(p => p !== value) })
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Seller Type</h2>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sellerType"
                value="individual"
                checked={formData.sellerType === 'individual'}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">Individual Seller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sellerType"
                value="dealer"
                checked={formData.sellerType === 'dealer'}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">Car Dealership</span>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Products You Sell</h2>
          
          <div className="flex gap-6">
            {['car', 'bike', 'commercial'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="productTypes"
                  value={type}
                  checked={formData.productTypes.includes(type)}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="capitalize font-medium text-gray-900 dark:text-gray-100">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.sellerType === 'dealer' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dealership Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="dealerInfo.registrationNumber"
                  value={formData.dealerInfo.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="CK/2018/123456/23"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                <input
                  type="number"
                  name="dealerInfo.establishedYear"
                  value={formData.dealerInfo.establishedYear}
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
                  name="dealerInfo.tradeLicenseNumber"
                  value={formData.dealerInfo.tradeLicenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                <input
                  type="text"
                  name="dealerInfo.vatNumber"
                  value={formData.dealerInfo.vatNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="VAT123456789"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="dealerInfo.website"
                  value={formData.dealerInfo.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://www.yourdealership.co.za"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About Your Dealership</label>
                <textarea
                  name="dealerInfo.about"
                  value={formData.dealerInfo.about}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell buyers about your dealership, your experience, and what makes you special..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="dealerInfo.address"
                  value={formData.dealerInfo.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="dealerInfo.city"
                  value={formData.dealerInfo.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  name="dealerInfo.province"
                  value={formData.dealerInfo.province}
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
                  name="dealerInfo.postalCode"
                  value={formData.dealerInfo.postalCode}
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

export default SellerProfile
