import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
const Home = lazy(() => import('./pages/Home'))
const Report = lazy(() => import('./pages/Report'))
const Payment = lazy(() => import('./pages/Payment'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const WorkerSignIn = lazy(() => import('./pages/WorkerSignIn'))
const WorkerSignUp = lazy(() => import('./pages/WorkerSignUp'))
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'))
const AdminSignIn = lazy(() => import('./pages/AdminSignIn'))
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Notification from './components/Notification'
import PrivateRoute from './components/PrivateRoute'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen font-body text-gray-800 overflow-x-hidden relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-hero-pattern opacity-30 pointer-events-none z-0"></div>
            <div className="relative z-10">

              <Suspense fallback={<div className="py-20"><LoadingSpinner size="lg" text="Loading..." /></div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/report" element={
                    <PrivateRoute role="user">
                      <Report />
                    </PrivateRoute>
                  } />
                  <Route path="/payment" element={
                    <PrivateRoute role="user">
                      <Payment />
                    </PrivateRoute>
                  } />
                  <Route path="/worker-dashboard" element={
                    <PrivateRoute role="worker">
                      <WorkerDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/admin" element={
                    <PrivateRoute role="admin">
                      <Home />
                    </PrivateRoute>
                  } />

                  {/* Public routes */}
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/worker-signin" element={<WorkerSignIn />} />
                  <Route path="/worker-signup" element={<WorkerSignUp />} />
                  <Route path="/admin-signin" element={<AdminSignIn />} />
                </Routes>
              </Suspense>

              <Notification />
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
