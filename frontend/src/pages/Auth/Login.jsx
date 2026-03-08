import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { motion } from 'framer-motion'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotData, setForgotData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [forgotErrors, setForgotErrors] = useState({})
  const [forgotLoading, setForgotLoading] = useState(false)
  const { login, forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const result = await login(formData.email, formData.password)
    setLoading(false)

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        switch (user.role) {
          case 'student':
            navigate('/student/dashboard')
            break
          case 'broker':
            navigate('/broker/dashboard')
            break
          case 'hostelAdmin':
            navigate('/hostel-admin/dashboard')
            break
          default:
            navigate('/')
        }
      }
    }
  }

  const openForgotPasswordModal = () => {
    setForgotData({
      email: formData.email || '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    })
    setForgotErrors({})
    setForgotStep(1)
    setShowForgotPasswordModal(true)
  }

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false)
    setForgotStep(1)
    setForgotErrors({})
    setForgotLoading(false)
  }

  const handleForgotFieldChange = (e) => {
    setForgotData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (forgotErrors[e.target.name]) {
      setForgotErrors((prev) => ({
        ...prev,
        [e.target.name]: ''
      }))
    }
  }

  const validateStrongPassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongRegex.test(password)
  }

  const sendForgotCode = async () => {
    const newErrors = {}
    if (!forgotData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(forgotData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (Object.keys(newErrors).length > 0) {
      setForgotErrors(newErrors)
      return
    }

    setForgotLoading(true)
    const result = await forgotPassword(forgotData.email)
    setForgotLoading(false)
    if (result.success) {
      setForgotStep(2)
      setForgotErrors({})
    }
  }

  const submitPasswordReset = async () => {
    const newErrors = {}
    if (!forgotData.code || forgotData.code.trim().length !== 6) {
      newErrors.code = 'Enter the 6-digit verification code'
    }
    if (!forgotData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (!validateStrongPassword(forgotData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 chars with uppercase, lowercase, number, and special char'
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(newErrors).length > 0) {
      setForgotErrors(newErrors)
      return
    }

    setForgotLoading(true)
    const result = await resetPassword(
      forgotData.email,
      forgotData.code.trim(),
      forgotData.newPassword
    )
    setForgotLoading(false)

    if (result.success) {
      closeForgotPasswordModal()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

        </form>
      </motion.div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-5 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">Reset your password</h3>
              <p className="mt-1 text-sm text-sky-100">
                {forgotStep === 1
                  ? 'Get a verification code on your Gmail account.'
                  : 'Enter the email code and set a new password.'}
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Gmail address
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={forgotData.email}
                  onChange={handleForgotFieldChange}
                  disabled={forgotStep === 2}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                  placeholder="Enter your email"
                />
                {forgotErrors.email && <p className="mt-1 text-sm text-rose-600">{forgotErrors.email}</p>}
              </div>

              {forgotStep === 2 && (
                <>
                  <div>
                    <label htmlFor="forgot-code" className="block text-sm font-medium text-slate-700 mb-1">
                      Verification code
                    </label>
                    <input
                      id="forgot-code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotData.code}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                        handleForgotFieldChange({
                          target: { name: 'code', value: sanitized }
                        })
                      }}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123456"
                    />
                    {forgotErrors.code && <p className="mt-1 text-sm text-rose-600">{forgotErrors.code}</p>}
                  </div>

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                      New password
                    </label>
                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      value={forgotData.newPassword}
                      onChange={handleForgotFieldChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Strong password"
                    />
                    {forgotErrors.newPassword && <p className="mt-1 text-sm text-rose-600">{forgotErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm new password
                    </label>
                    <input
                      id="confirm-new-password"
                      name="confirmPassword"
                      type="password"
                      value={forgotData.confirmPassword}
                      onChange={handleForgotFieldChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Re-enter password"
                    />
                    {forgotErrors.confirmPassword && <p className="mt-1 text-sm text-rose-600">{forgotErrors.confirmPassword}</p>}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                {forgotStep === 2 ? (
                  <button
                    type="button"
                    onClick={sendForgotCode}
                    disabled={forgotLoading}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-slate-400"
                  >
                    Resend code
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  {forgotStep === 1 ? (
                    <button
                      type="button"
                      onClick={sendForgotCode}
                      disabled={forgotLoading}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Sending...' : 'Send code'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitPasswordReset}
                      disabled={forgotLoading}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating...' : 'Update password'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

