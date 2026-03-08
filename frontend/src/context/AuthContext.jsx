import { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    email: '',
    code: '',
    isResending: false,
    error: ''
  })
  const verificationResolverRef = useRef(null)

  const clearAuthSession = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const storeAuthSession = (data, successMessage = 'Login successful!') => {
    const token = data.token
    if (!token) {
      throw new Error('No token received from server')
    }

    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format received')
    }

    localStorage.setItem('token', token)
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))
    toast.success(successMessage)
  }

  useEffect(() => {
    // Only trust auth state when both user and token exist.
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        clearAuthSession()
      }
    } else {
      clearAuthSession()
    }
    setLoading(false)

    return () => {
      // Resolve a pending modal promise if provider unmounts.
      if (verificationResolverRef.current) {
        verificationResolverRef.current(null)
        verificationResolverRef.current = null
      }
    }
  }, [])

  const closeVerificationModal = (value = null) => {
    if (verificationResolverRef.current) {
      verificationResolverRef.current(value)
      verificationResolverRef.current = null
    }
    setVerificationModal({
      isOpen: false,
      email: '',
      code: '',
      isResending: false,
      error: ''
    })
  }

  const openVerificationModal = (email) =>
    new Promise((resolve) => {
      verificationResolverRef.current = resolve
      setVerificationModal({
        isOpen: true,
        email,
        code: '',
        isResending: false,
        error: ''
      })
    })

  const requestVerificationCode = async (email) => {
    const code = await openVerificationModal(email)
    if (!code || !code.trim()) {
      throw new Error('Email verification code is required to continue')
    }
    return code.trim()
  }

  const handleVerificationCodeChange = (event) => {
    const sanitized = event.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setVerificationModal((prev) => ({
      ...prev,
      code: sanitized,
      error: ''
    }))
  }

  const submitVerificationCode = () => {
    if (verificationModal.code.length !== 6) {
      setVerificationModal((prev) => ({
        ...prev,
        error: 'Please enter the 6-digit verification code.'
      }))
      return
    }
    closeVerificationModal(verificationModal.code)
  }

  const resendFromModal = async () => {
    if (!verificationModal.email || verificationModal.isResending) {
      return
    }

    setVerificationModal((prev) => ({
      ...prev,
      isResending: true,
      error: ''
    }))

    const result = await resendVerificationCode(verificationModal.email)

    setVerificationModal((prev) => ({
      ...prev,
      isResending: false,
      error: result.success ? '' : result.error || 'Could not resend verification code.'
    }))
  }

  const login = async (email, password) => {
    try {
      // Clear stale session before a new login attempt.
      clearAuthSession()

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
        if ((data.message || '').toLowerCase().includes('not verified')) {
          const code = await requestVerificationCode(email)

          const verifyResult = await verifyEmail(email, code)
          if (verifyResult.success) {
            return verifyResult
          }
        }
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        storeAuthSession(data, 'Login successful!')
        return { success: true }
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      clearAuthSession()
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
        if (data.requiresVerification) {
          toast.success(data.message || 'Verification code sent to your email')
          const code = await requestVerificationCode(userData.email)
          return await verifyEmail(userData.email, code)
        }

        storeAuthSession(data, 'Account created successfully!')
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

  const verifyEmail = async (email, code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed')
      }

      if (!data.success) {
        throw new Error(data.message || 'Email verification failed')
      }

      storeAuthSession(data, 'Email verified and login successful!')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Email verification failed')
      return { success: false, error: error.message }
    }
  }

  const resendVerificationCode = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend verification code')
      }

      toast.success(data.message || 'Verification code sent')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification code')
      return { success: false, error: error.message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send password reset code')
      }

      toast.success(data.message || 'Password reset code sent')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Failed to send password reset code')
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password')
      }

      toast.success(data.message || 'Password reset successful')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password')
      return { success: false, error: error.message }
    }
  }

  const googleAuth = async (payload = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Google authentication failed')
      }

      storeAuthSession(data, 'Google authentication successful!')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Google authentication failed')
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    clearAuthSession()
    toast.success('Logged out successfully')
    window.location.href = '/'
  }

  const value = {
    user,
    setUser,
    login,
    signup,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    googleAuth,
    logout,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        email={verificationModal.email}
        code={verificationModal.code}
        error={verificationModal.error}
        isResending={verificationModal.isResending}
        onCodeChange={handleVerificationCodeChange}
        onSubmit={submitVerificationCode}
        onCancel={() => closeVerificationModal(null)}
        onResend={resendFromModal}
      />
    </AuthContext.Provider>
  )
}

const VerificationModal = ({
  isOpen,
  email,
  code,
  error,
  isResending,
  onCodeChange,
  onSubmit,
  onCancel,
  onResend
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-5">
          <h3 className="text-lg font-semibold text-white">Verify your email</h3>
          <p className="mt-1 text-sm text-sky-100">Enter the 6-digit code sent to your Gmail account.</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</p>
            <p className="truncate text-sm font-medium text-slate-800">{email}</p>
          </div>

          <div>
            <label htmlFor="verification-code" className="mb-2 block text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={onCodeChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSubmit()
                }
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="123456"
            />
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className="text-sm font-medium text-sky-700 transition hover:text-sky-900 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

