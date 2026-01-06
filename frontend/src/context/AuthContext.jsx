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
    // Check for stored user data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

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

      if (data.success) {
        // Store token and user data
        const token = data.token
        if (!token) {
          throw new Error('No token received from server')
        }
        
        // Verify token format (should be a valid JWT)
        const tokenParts = token.split('.')
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format received')
        }
        
        localStorage.setItem('token', token)
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Login successful!')
        return { success: true }
      } else {
        throw new Error(data.message || 'Login failed')
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

