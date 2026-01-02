import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

// Auth Pages
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard'
import PGList from './pages/Student/PGList'
import HostelList from './pages/Student/HostelList'
import Marketplace from './pages/Student/Marketplace'
import PGDetails from './pages/Student/PGDetails'
import HostelDetails from './pages/Student/HostelDetails'

// Broker Pages
import BrokerDashboard from './pages/Broker/BrokerDashboard'
import AddPG from './pages/Broker/AddPG'
import EditPG from './pages/Broker/EditPG'
import MyPGs from './pages/Broker/MyPGs'

// Hostel Admin Pages
import HostelAdminDashboard from './pages/HostelAdmin/HostelAdminDashboard'
import AddHostel from './pages/HostelAdmin/AddHostel'
import EditHostel from './pages/HostelAdmin/EditHostel'
import MyHostels from './pages/HostelAdmin/MyHostels'

// Chat
import Chat from './pages/Chat/Chat'

// Home
import Home from './pages/Home'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/pg"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PGList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/hostel"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HostelList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/marketplace"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Marketplace />
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
              <Route
                path="/student/hostel/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HostelDetails />
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
                path="/broker/add-pg"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <AddPG />
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
              <Route
                path="/hostel-admin/add-hostel"
                element={
                  <ProtectedRoute allowedRoles={['hostelAdmin']}>
                    <AddHostel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostel-admin/my-hostels"
                element={
                  <ProtectedRoute allowedRoles={['hostelAdmin']}>
                    <MyHostels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostel-admin/edit-hostel/:id"
                element={
                  <ProtectedRoute allowedRoles={['hostelAdmin']}>
                    <EditHostel />
                  </ProtectedRoute>
                }
              />

              {/* Chat Route */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

