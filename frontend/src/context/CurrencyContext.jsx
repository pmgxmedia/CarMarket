import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

export const currencies = [
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
]

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currency')
      return saved || 'ZAR'
    }
    return 'ZAR'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency)
    }
  }, [currency])

  const formatPrice = (amount) => {
    const currencyInfo = currencies.find(c => c.code === currency) || currencies[0]
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  )
}
