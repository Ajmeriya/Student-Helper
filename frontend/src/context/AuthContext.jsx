import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../utils/constants.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data and validate token
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser)
        setUser(user)
        
        // Verify token is still valid by calling /api/auth/me
        verifyToken(storedToken)
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      })
      
      if (!response.ok) {
        // Token is invalid, clear storage
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
      } else {
        const data = await response.json()
        if (data.success && data.data) {
          // Update user data
          setUser(data.data)
          localStorage.setItem('user', JSON.stringify(data.data))
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const login = async (email, password) => {
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.success && data.token && data.user) {
        // Store token and user data - trim token to remove any whitespace
        const token = data.token.trim()
        localStorage.setItem('token', token)
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('✅ Login successful, token stored:', token.substring(0, 20) + '...')
        toast.success('Login successful!')
        return { success: true }
      } else {
        console.error('❌ Login response missing token or user:', data)
        throw new Error(data.message || 'Login failed - invalid response')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.message || 'Signup failed')
      }

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Account created successfully!')
        return { success: true }
      } else {
        throw new Error(data.message || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Signup failed')
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token') // Also remove token
    toast.success('Logged out successfully')
    window.location.href = '/'
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
