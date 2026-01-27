import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'

// Auth Pages
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

// Student Pages
import PGList from './pages/Student/PGList'
import PGDetails from './pages/Student/PGDetails'
import Marketplace from './pages/Student/Marketplace'
import AddItem from './pages/Student/AddItem'
import MyItems from './pages/Student/MyItems'
import EditItem from './pages/Student/EditItem'

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
              
              {/* Student PG Routes */}
              <Route
                path="/student/pg"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PGList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/pg/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PGDetails />
                  </ProtectedRoute>
                }
              />

              {/* Student Marketplace Routes */}
              <Route
                path="/student/marketplace"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/add-item"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AddItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/my-items"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/edit-item/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <EditItem />
                  </ProtectedRoute>
                }
              />
              
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
