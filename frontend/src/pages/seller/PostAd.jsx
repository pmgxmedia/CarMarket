import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { 
  vehicleMakes, 
  carModels,
  bikeModels,
  fuelTypes, 
  transmissions, 
  categories,
  bodyTypes,
  southAfricanProvinces,
  saCities,
  conditionOptions,
  ownerCounts,
  colorOptions,
  cylinderCounts
} from '../../utils/helpers'
import { useCurrency } from '../../context/CurrencyContext'

const PostAd = () => {
  const { formatPrice } = useCurrency()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    category: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    variant: '',
    bodyType: '',
    fuelType: 'petrol',
    transmission: 'manual',
    kmDriven: '',
    color: '',
    condition: 'Good',
    previousOwners: '1st Owner',
    cylinderCount: '',
    engineSize: '',
    power: '',
    torque: '',
    location: '',
    province: '',
    askingPrice: '',
    negotiable: true,
    description: '',
    targetAudience: 'both',
    images: [],
    features: [],
    isLicensed: true,
    roadworthyAvailable: false,
    registrationNumber: ''
  })

  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    if (isEdit) {
      fetchAd()
    }
  }, [id])

  const fetchAd = async () => {
    try {
      const { data } = await api.get(`/ads/${id}`)
      if (data.sellerId._id !== JSON.parse(atob(localStorage.getItem('token')?.split('.')[1]))?.userId) {
        toast.error('You do not have permission to edit this ad')
        navigate('/seller/my-ads')
        return
      }
      setFormData({
        category: data.category,
        make: data.make,
        model: data.model,
        year: data.year,
        variant: data.variant || '',
        bodyType: data.bodyType || '',
        fuelType: data.fuelType || 'Petrol',
        transmission: data.transmission || 'Manual',
        kmDriven: data.kmDriven,
        color: data.color || '',
        condition: data.condition || 'Good',
        previousOwners: data.previousOwners || '1st Owner',
        cylinderCount: data.cylinderCount || '',
        engineSize: data.engineSize || '',
        power: data.power || '',
        torque: data.torque || '',
        location: data.location,
        province: data.province || '',
        askingPrice: data.askingPrice,
        negotiable: data.negotiable !== false,
        description: data.description,
        targetAudience: data.targetAudience || 'both',
        images: data.images || [],
        features: data.features || [],
        isLicensed: data.isLicensed !== false,
        roadworthyAvailable: data.roadworthyAvailable || false,
        registrationNumber: data.registrationNumber || ''
      })
    } catch (error) {
      toast.error('Failed to load ad')
      navigate('/seller/my-ads')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const numberFields = ['year', 'kmDriven', 'askingPrice', 'engineSize', 'power', 'torque']
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (numberFields.includes(name) ? Number(value) : value),
      ...(name === 'province' ? { location: '' } : {})
    }))
  }

  const handleModelChange = (model) => {
    setFormData(prev => ({ ...prev, model }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (formData.images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setUploading(true)
    try {
      const uploadData = new FormData()
      files.forEach(file => uploadData.append('images', file))

      const { data } = await api.post('/upload/images', uploadData)

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...data.images]
      }))
      toast.success(`${files.length} image(s) uploaded`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.error || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    const items = Array.from(formData.images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    const reorderedItems = items.map((img, idx) => ({ ...img, order: idx }))
    setFormData(prev => ({ ...prev, images: reorderedItems }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const validateStep1 = () => {
    if (formData.images.length < 3) {
      toast.error('Please upload at least 3 images')
      return false
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.make) {
      toast.error('Please select a make')
      return false
    }
    if (!formData.model) {
      toast.error('Please select or enter a model')
      return false
    }
    if (!formData.year || !formData.fuelType || !formData.transmission || !formData.kmDriven) {
      toast.error('Please fill all required fields')
      return false
    }
    if (formData.kmDriven < 0) {
      toast.error('KM driven cannot be negative')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!formData.location || !formData.askingPrice || !formData.description) {
      toast.error('Please fill all required fields')
      return false
    }
    if (formData.askingPrice < 1000) {
      toast.error('Asking price must be at least R1,000')
      return false
    }
    if (formData.description.length < 50) {
      toast.error('Description must be at least 50 characters')
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/ads/${id}`, formData)
        toast.success('Draft saved!')
      } else {
        const { data } = await api.post('/ads', formData)
        toast.success('Draft saved!')
        navigate(`/seller/post-ad/${data.ad._id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!validateStep3()) return

    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/ads/${id}`, formData)
        const { data } = await api.post(`/ads/${id}/publish`)
        toast.success(data.message || 'Ad published successfully!')
      } else {
        const { data: createData } = await api.post('/ads', formData)
        const { data: publishData } = await api.post(`/ads/${createData.ad._id}/publish`)
        toast.success(publishData.message || 'Ad published successfully!')
      }
      navigate('/seller/my-ads')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to publish ad')
    } finally {
      setLoading(false)
    }
  }

  const getModelsForMake = (make) => {
    if (formData.category === 'car' && carModels[make]) return carModels[make]
    if (formData.category === 'bike' && bikeModels[make]) return bikeModels[make]
    return []
  }

  const models = getModelsForMake(formData.make)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {isEdit ? 'Edit Ad' : 'Post New Ad'}
        </h1>

        <div className="flex mb-8">
          {['Photos', 'Details', 'Pricing'].map((label, idx) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1 ${step > idx + 1 ? 'bg-primary-600' : step === idx + 1 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'} rounded`}
              />
              <p className={`text-sm mt-2 ${step === idx + 1 ? 'text-primary-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {idx + 1}. {label}
              </p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat, make: '', model: '', bodyType: '' })}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      formData.category === cat 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {cat === 'car' ? '🚗' : cat === 'bike' ? '🏍️' : '🚛'}
                    </div>
                    <p className="capitalize font-medium text-gray-800 dark:text-white">{cat}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos (Min 3, Max 10) *
              </label>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="images" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-5 gap-4"
                    >
                      {formData.images.map((image, index) => (
                        <Draggable key={image.publicId || index} draggableId={image.publicId || `img-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                                snapshot.isDragging ? 'border-primary-500' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <img src={image.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                              >
                                ✕
                              </button>
                              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {formData.images.length < 10 && (
                        <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                          <span className="text-2xl text-gray-400">+</span>
                          <span className="text-xs text-gray-400 mt-1">Add</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Drag to reorder. First image is the cover photo.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setStep(2)
                  }
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Next: Details →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={(e) => handleChange(e)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Make</option>
                  {vehicleMakes[formData.category]?.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model *</label>
                {models.length > 0 ? (
                  <select
                    name="model"
                    value={formData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Model</option>
                    {models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Enter model"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variant</label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  placeholder="e.g., GLS, Executive"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Type</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {bodyTypes[formData.category]?.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Owners</label>
                <select
                  name="previousOwners"
                  value={formData.previousOwners}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {ownerCounts.map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuel Type *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {fuelTypes.map((fuel) => (
                    <option key={fuel} value={fuel}>{fuel.charAt(0).toUpperCase() + fuel.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transmission *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {transmissions.map((trans) => (
                    <option key={trans} value={trans}>{trans.charAt(0).toUpperCase() + trans.slice(1).replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">KM Driven *</label>
                <input
                  type="number"
                  name="kmDriven"
                  value={formData.kmDriven}
                  onChange={handleChange}
                  min={0}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cylinders</label>
                <select
                  name="cylinderCount"
                  value={formData.cylinderCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {cylinderCounts.map((cyl) => (
                    <option key={cyl} value={cyl}>{cyl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engine Size (cc)</label>
                <input
                  type="number"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleChange}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Power (kW)</label>
                <input
                  type="number"
                  name="power"
                  value={formData.power}
                  onChange={handleChange}
                  placeholder="e.g., 110"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Features & Extras</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center gap-2">
                    {feature}
                    <button onClick={() => removeFeature(index)} className="hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add feature (e.g., Air Conditioning)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Documentation</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="isLicensed"
                    checked={formData.isLicensed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Licensed & Registered</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle has valid registration</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    name="roadworthyAvailable"
                    checked={formData.roadworthyAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Roadworthy Available</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Certificate of roadworthiness</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) {
                    setStep(3)
                  }
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Next: Pricing →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Province</option>
                  {southAfricanProvinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!formData.province}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {formData.province && saCities[formData.province]?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asking Price (R) *</label>
                <input
                  type="number"
                  name="askingPrice"
                  value={formData.askingPrice}
                  onChange={handleChange}
                  min={1000}
                  placeholder="e.g., 250000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g., CA 123-456"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Price is negotiable</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience *</label>
              <div className="flex gap-4">
                {[
                  { value: 'both', label: 'All Buyers' },
                  { value: 'dealer', label: 'Dealers Only' },
                  { value: 'individual', label: 'Individuals Only' }
                ].map((type) => (
                  <label key={type.value} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="targetAudience"
                      value={type.value}
                      checked={formData.targetAudience === type.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your vehicle condition, features, service history, any modifications, reason for selling, etc. (min 50 characters)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.description.length}/50 characters minimum</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-gray-500 dark:text-gray-400">Vehicle:</span> <span className="text-gray-800 dark:text-white">{formData.make} {formData.model}</span></p>
                <p><span className="text-gray-500 dark:text-gray-400">Year:</span> <span className="text-gray-800 dark:text-white">{formData.year}</span></p>
                <p><span className="text-gray-500 dark:text-gray-400">KM:</span> <span className="text-gray-800 dark:text-white">{formData.kmDriven?.toLocaleString()}</span></p>
                <p><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="text-gray-800 dark:text-white">{formatPrice(formData.askingPrice)}</span></p>
                <p><span className="text-gray-500 dark:text-gray-400">Location:</span> <span className="text-gray-800 dark:text-white">{formData.location}, {formData.province}</span></p>
                <p><span className="text-gray-500 dark:text-gray-400">Photos:</span> <span className="text-gray-800 dark:text-white">{formData.images.length}</span></p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                ← Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Ad'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostAd
