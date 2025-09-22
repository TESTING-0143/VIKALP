import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSignInAlt, 
  faEye,
  faEyeSlash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import AuthStatus from '../components/AuthStatus'

const SignIn = () => {
  const { signIn, signInWithGoogle } = useAuth()
  const { showSuccess, showError } = useNotification()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      showError('Please fill in all fields.')
      return
    }
    setIsLoading(true)
    try {
      await signIn(formData.email, formData.password)
      showSuccess('Signed in successfully!')
      navigate('/')
    } catch (error) {
      console.error('Sign in error:', error)
      if (error.code === 'auth/user-not-found') {
        showError('No account found with this email address.')
      } else if (error.code === 'auth/wrong-password') {
        showError('Incorrect password.')
      } else if (error.code === 'auth/invalid-email') {
        showError('Invalid email address.')
      } else if (error.code === 'auth/too-many-requests') {
        showError('Too many failed attempts. Please try again later.')
      } else {
        showError('Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      showSuccess('Signed in with Google successfully!')
      navigate('/')
    } catch (error) {
      console.error('Google sign in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        showError('Sign in was cancelled.')
      } else if (error.code === 'auth/popup-blocked') {
        showError('Popup was blocked. Please allow popups and try again.')
      } else {
        showError('Failed to sign in with Google. Please try again.')
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen font-body text-gray-800">
      {/* Header */}
      <header className="glass-effect shadow-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/image3.webp" alt="Logo" className="h-12 w-12 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-800 font-heading">Clean and Healthy Area</span>
              <span className="text-gray-600 text-sm font-semibold">Sign In</span>
            </div>
          </div>
          <AuthStatus />
        </div>
      </header>

      {/* Content */}
      <main className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-3xl shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 font-heading">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-lg">Sign in to continue</p>
            </div>

            {/* Google button */}
            <div className="mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full bg-white/90 border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition hover:bg-gray-50 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-6 h-6" />
                )}
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 glass-effect text-gray-500 rounded-full">
                  Or sign in with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} required
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50">
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700">Sign up here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignIn
