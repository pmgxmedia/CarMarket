import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const defaultSettings = {
  heroTitle: 'Buy & Sell Vehicles',
  heroSubtitle: 'The Smarter Way',
  heroDescription: 'Connect with verified buyers and sellers. Get the best deals through our transparent bidding system.',
  ctaPrimary: 'Start Selling',
  ctaSecondary: 'Browse Ads',
  categories: [
    { name: 'Cars', emoji: '🚗', description: 'Sedans, SUVs, Hatchbacks' },
    { name: 'Bikes', emoji: '🏍️', description: 'Motorcycles, Scooters' },
    { name: 'Commercial', emoji: '🚛', description: 'Trucks, Vans, Buses, Trailers' }
  ],
  features: [
    { icon: '📸', title: 'Multi-Photo Gallery', description: 'Showcase your vehicle with up to 10 photos' },
    { icon: '🎯', title: 'Smart Bidding', description: 'Get competitive bids from verified buyers' },
    { icon: '🤝', title: 'Secure Transactions', description: 'Verified buyers and transparent process' }
  ],
  maintenanceMode: false,
  maintenanceMessage: 'We are currently under maintenance. Please check back soon.'
}

const Landing = () => {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/platform-settings')
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings')
    }
  }

  if (settings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-white mb-4">Under Maintenance</h1>
          <p className="text-white/80">{settings.maintenanceMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      <nav className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">CarMarket</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              {settings.heroTitle}<br />
              <span className="text-yellow-300">{settings.heroSubtitle}</span>
            </h2>
            <p className="mt-6 text-xl text-white/80">
              {settings.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors font-semibold"
              >
                {settings.ctaPrimary}
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-semibold"
              >
                Explore
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors font-semibold"
              >
                {settings.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {settings.categories.map((category, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl p-6 shadow-lg ${category.name === 'Commercial' ? 'col-span-2' : ''}`}
                  >
                    <div className="text-4xl mb-4">{category.emoji}</div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg truncate">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {settings.features.map((feature, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-white/70 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Landing
