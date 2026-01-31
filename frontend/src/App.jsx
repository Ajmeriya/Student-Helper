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
import StudentDashboard from './pages/Student/StudentDashboard'
import PGList from './pages/Student/PGList'
import PGDetails from './pages/Student/PGDetails'
import HostelList from './pages/Student/HostelList'
import HostelDetails from './pages/Student/HostelDetails'
import Marketplace from './pages/Student/Marketplace'
import AddItem from './pages/Student/AddItem'
import MyItems from './pages/Student/MyItems'
import EditItem from './pages/Student/EditItem'

// Broker Pages
import BrokerDashboard from './pages/Broker/BrokerDashboard'
import MyPGs from './pages/Broker/MyPGs'
import AddPG from './pages/Broker/AddPG'
import EditPG from './pages/Broker/EditPG'

// Hostel Admin Pages
import HostelAdminDashboard from './pages/HostelAdmin/HostelAdminDashboard'

// Chat & Profile Pages
import Chat from './pages/Chat/Chat'
import EditProfile from './pages/Profile/EditProfile'

// Layout Components
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Student Dashboard */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

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

              {/* Student Hostel Routes */}
              <Route
                path="/student/hostel"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HostelList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/hostel/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HostelDetails />
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

              {/* Chat Routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* Profile Routes */}
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              
              {/* Broker Routes */}
              <Route
                path="/broker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <BrokerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/broker/my-pgs"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <MyPGs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/broker/add-pg"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <AddPG />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/broker/edit-pg/:id"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <EditPG />
                  </ProtectedRoute>
                }
              />

              {/* Hostel Admin Routes */}
              <Route
                path="/hostel-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hostelAdmin']}>
                    <HostelAdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          
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
