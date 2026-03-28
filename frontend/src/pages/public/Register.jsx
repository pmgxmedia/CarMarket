import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [formData, setFormData] = useState({
    name: '', businessName: '', email: '', phone: '', password: '', confirmPassword: '',
    location: '', productTypes: [], category: [], buyerType: '', sellerType: '', gstin: '', secretKey: ''
  })
  const [loading, setLoading] = useState(false)
  const { sellerRegister, buyerRegister, adminRegister } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, checked } = e.target
    
    if (name === 'productTypes' || name === 'category') {
      const arr = formData[name]
      if (checked) {
        setFormData({ ...formData, [name]: [...arr, value] })
      } else {
        setFormData({ ...formData, [name]: arr.filter(v => v !== value) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const validateStep2 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.location) {
      toast.error('Please fill all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }
    if (role === 'seller' && !formData.sellerType) {
      toast.error('Select your seller type')
      return false
    }
    if (role === 'seller' && formData.productTypes.length === 0) {
      toast.error('Select at least one product type')
      return false
    }
    if (role === 'buyer' && !formData.buyerType) {
      toast.error('Select your buyer type')
      return false
    }
    if (role === 'buyer' && formData.category.length === 0) {
      toast.error('Select at least one category')
      return false
    }
    if ((role === 'buyer' && formData.buyerType === 'business') && !formData.businessName) {
      toast.error('Business name is required')
      return false
    }
    if (role === 'admin' && !formData.secretKey) {
      toast.error('Admin secret key is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return

    setLoading(true)
    try {
      if (role === 'seller') {
        await sellerRegister(formData)
      } else if (role === 'buyer') {
        await buyerRegister(formData)
      } else if (role === 'admin') {
        await adminRegister(formData)
      }
      toast.success('Registration successful!')
      navigate(`/${role}/dashboard`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Go to Home"
      >
        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {isDark ? (
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">CarMarket</Link>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {step === 1 ? 'Choose your role' : `Register as ${role}`}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('seller')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-2xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900">
                  🏪
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">I'm a Seller</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">List your vehicles and get bids from buyers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('buyer')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-2xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900">
                  🛒
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">I'm a Buyer</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Find the best deals on vehicles</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-2xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900">
                  👨‍💼
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Admin</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Platform administration</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              ← Back to role selection
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {(role === 'seller' || role === 'buyer') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {role === 'seller' ? 'Seller Type' : 'Buyer Type'} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['individual', 'business', 'other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const fieldName = role === 'seller' ? 'sellerType' : 'buyerType'
                        setFormData({ ...formData, [fieldName]: type })
                      }}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        (role === 'seller' ? formData.sellerType : formData.buyerType) === type
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(role === 'seller' || role === 'buyer') && (role === 'seller' ? formData.sellerType === 'business' : formData.buyerType === 'business') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your business name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="City/Town"
                  required
                />
              </div>
            </div>

            {role === 'seller' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Types *</label>
                <div className="flex gap-4">
                  {['car', 'bike', 'commercial'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        name="productTypes"
                        value={type}
                        checked={formData.productTypes.includes(type)}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 rounded dark:bg-gray-700"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {role === 'buyer' && (
              <>
                {formData.buyerType === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN *</label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-primary-500"
                      maxLength={15}
                      placeholder="15 character GSTIN"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories *</label>
                  <div className="flex gap-4">
                    {['car', 'bike', 'commercial'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          name="category"
                          value={cat}
                          checked={formData.category.includes(cat)}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-600 rounded dark:bg-gray-700"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Secret Key *</label>
                <input
                  type="password"
                  name="secretKey"
                  value={formData.secretKey || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter admin secret key"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
