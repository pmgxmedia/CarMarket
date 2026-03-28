import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile')
      setUser(data)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const sellerRegister = async (userData) => {
    const { data } = await api.post('/auth/seller/register', userData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const buyerRegister = async (userData) => {
    const { data } = await api.post('/auth/buyer/register', userData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const adminRegister = async (userData) => {
    const { data } = await api.post('/auth/admin/register', userData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const becomeSeller = async (sellerData) => {
    const { data } = await api.post('/auth/become-seller', sellerData)
    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, sellerRegister, buyerRegister, adminRegister, logout, updateUser, fetchProfile, becomeSeller }}>
      {children}
    </AuthContext.Provider>
  )
}
