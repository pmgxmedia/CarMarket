import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    ctaPrimary: '',
    ctaSecondary: '',
    categories: [],
    features: [],
    maintenanceMode: false,
    maintenanceMessage: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/platform-settings')
      setSettings({
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        heroDescription: data.heroDescription || '',
        ctaPrimary: data.ctaPrimary || '',
        ctaSecondary: data.ctaSecondary || '',
        categories: data.categories || [],
        features: data.features || [],
        maintenanceMode: data.maintenanceMode || false,
        maintenanceMessage: data.maintenanceMessage || ''
      })
    } catch (error) {
      console.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const updateCategory = (index, field, value) => {
    const newCategories = [...settings.categories]
    newCategories[index] = { ...newCategories[index], [field]: value }
    setSettings(prev => ({ ...prev, categories: newCategories }))
  }

  const addCategory = () => {
    setSettings(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', emoji: '', description: '' }]
    }))
  }

  const removeCategory = (index) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index, field, value) => {
    const newFeatures = [...settings.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setSettings(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setSettings(prev => ({
      ...prev,
      features: [...prev.features, { icon: '', title: '', description: '' }]
    }))
  }

  const removeFeature = (index) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/platform-settings', settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save settings')
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Platform Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hero Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Title</label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Buy & Sell Vehicles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={settings.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="The Smarter Way"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={settings.heroDescription}
              onChange={(e) => handleChange('heroDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Connect with verified buyers and sellers..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary CTA Button</label>
            <input
              type="text"
              value={settings.ctaPrimary}
              onChange={(e) => handleChange('ctaPrimary', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Start Selling"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary CTA Button</label>
            <input
              type="text"
              value={settings.ctaSecondary}
              onChange={(e) => handleChange('ctaSecondary', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Browse Ads"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Categories</h2>
          <button
            onClick={addCategory}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + Add Category
          </button>
        </div>
        <div className="space-y-4">
          {settings.categories.map((category, index) => (
            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    value={category.emoji}
                    onChange={(e) => updateCategory(index, 'emoji', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-2xl"
                    placeholder="🚗"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Category Name"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => updateCategory(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Description"
                  />
                </div>
              </div>
              <button
                onClick={() => removeCategory(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          {settings.categories.length === 0 && (
            <p className="text-center text-gray-500 py-4">No categories added. Click "Add Category" to create one.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Features</h2>
          <button
            onClick={addFeature}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + Add Feature
          </button>
        </div>
        <div className="space-y-4">
          {settings.features.map((feature, index) => (
            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-2xl"
                    placeholder="📸"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Feature Title"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Feature Description"
                  />
                </div>
              </div>
              <button
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                ✕
              </button>
            </div>
          ))}
          {settings.features.length === 0 && (
            <p className="text-center text-gray-500 py-4">No features added. Click "Add Feature" to create one.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Maintenance Mode</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">Enable Maintenance Mode</span>
          </label>
          {settings.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Message</label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="We are currently under maintenance..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlatformSettings
