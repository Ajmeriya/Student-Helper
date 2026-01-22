import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'

// Auth Pages
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes - Placeholders for future development */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                          Student Dashboard
                        </h1>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/broker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                          Broker Dashboard
                        </h1>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostel-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hostelAdmin']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                          Hostel Admin Dashboard
                        </h1>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
