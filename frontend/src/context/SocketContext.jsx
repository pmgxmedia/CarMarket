import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const token = localStorage.getItem('token')
      
      const newSocket = io('/', {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      newSocket.on('notification:new', (notification) => {
        console.log('New notification:', notification)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
