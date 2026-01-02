import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

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
      // ⏳ STEP 1: Authentication API Integration
      // TODO: Replace with actual API call
      // 
      // When ready, uncomment and use:
      // import { apiRequest } from '../utils/api.js'
      // const result = await apiRequest('/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password })
      // })
      // if (result.success) {
      //   const { token, user } = result.data
      //   localStorage.setItem('token', token)
      //   setUser(user)
      //   localStorage.setItem('user', JSON.stringify(user))
      //   return { success: true }
      // }
      
      // Mock login for now (using fake data)
      const mockUser = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'student',
        city: 'Nadiad',
        collegeName: 'Example College'
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      // ⏳ STEP 1: Authentication API Integration
      // TODO: Replace with actual API call
      // 
      // When ready, uncomment and use:
      // import { apiRequest } from '../utils/api.js'
      // const result = await apiRequest('/auth/signup', {
      //   method: 'POST',
      //   body: JSON.stringify(userData)
      // })
      // if (result.success) {
      //   const { token, user } = result.data
      //   localStorage.setItem('token', token)
      //   setUser(user)
      //   localStorage.setItem('user', JSON.stringify(user))
      //   return { success: true }
      // }
      
      // Mock signup for now (using fake data)
      const newUser = {
        id: Date.now().toString(),
        ...userData
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
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

