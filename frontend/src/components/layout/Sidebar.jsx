import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sellerLinks = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/seller/post-ad', label: 'Post New Ad', icon: '➕' },
    { path: '/seller/my-ads', label: 'My Ads', icon: '📋' },
    { path: '/seller/marketplace', label: 'Marketplace', icon: '🏪' },
    { path: '/seller/my-bids', label: 'My Bids', icon: '🎯' },
    { path: '/seller/transactions', label: 'Transactions', icon: '💰' },
    { path: '/seller/payment-settings', label: 'Payment Settings', icon: '🏦' },
    { path: '/seller/profile', label: 'Profile', icon: '👤' },
  ]

  const buyerLinks = [
    { path: '/buyer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/buyer/available-ads', label: 'Available Ads', icon: '🚗' },
    { path: '/buyer/my-bids', label: 'My Bids', icon: '🎯' },
    { path: '/buyer/active-deal', label: 'Active Deal', icon: '🤝' },
    { path: '/buyer/profile', label: 'Profile', icon: '👤' },
  ]

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/ads', label: 'Ads', icon: '📋' },
    { path: '/admin/transactions', label: 'Transactions', icon: '💰' },
  ]

  const links = user?.role === 'seller' ? sellerLinks : user?.role === 'buyer' ? buyerLinks : adminLinks

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">CarMarket</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} Portal</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
