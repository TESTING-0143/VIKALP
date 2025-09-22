// signup.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUserPlus,
  faEye,
  faEyeSlash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import AuthStatus from '../components/AuthStatus'

const SignUp = () => {
  const { signUp, signInWithGoogle } = useAuth()
  const { showSuccess, showError } = useNotification()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      showError('Please fill in all fields.')
      return false
    }
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters long.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.')
      return false
    }
    if (!agreedToTerms) {
      showError('Please agree to the Terms of Service and Privacy Policy.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName)
      showSuccess('Account created successfully! Welcome to EcoVision!')
      navigate('/')
    } catch (error) {
      console.error('Sign up error:', error)
      if (error.code === 'auth/email-already-in-use') {
        showError('An account with this email already exists.')
      } else if (error.code === 'auth/invalid-email') {
        showError('Invalid email address.')
      } else if (error.code === 'auth/weak-password') {
        showError('Password is too weak. Please choose a stronger password.')
      } else {
        showError('Failed to create account. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      showSuccess('Account created with Google successfully!')
      navigate('/')
    } catch (error) {
      console.error('Google sign up error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        showError('Sign up was cancelled.')
      } else if (error.code === 'auth/popup-blocked') {
        showError('Popup was blocked. Please allow popups and try again.')
      } else {
        showError('Failed to sign up with Google. Please try again.')
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
            <img 
              src="/image3.webp" 
              alt="Logo" 
              className="h-12 w-12 rounded-2xl object-cover border-4 border-white/30 shadow-xl" 
            />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-800 font-heading">
                Clean and Healthy Area
              </span>
              <span className="text-gray-600 text-sm font-semibold">Sign Up</span>
            </div>
          </div>
          <AuthStatus />
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-3xl shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 font-heading">
                Join Our Community
              </h1>
              <p className="text-gray-600 text-lg">Create your account to start reporting issues</p>
            </div>

            {/* Google Sign Up */}
            <div className="mb-8">
              <button
                onClick={handleGoogleSignUp}
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
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="First name"
                  className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Last name"
                  className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a password"
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm password"
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <span className="text-emerald-600 font-semibold">Terms of Service</span> and <span className="text-emerald-600 font-semibold">Privacy Policy</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                )}
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                Already have an account?{' '}
                <Link to="/signin" className="text-emerald-600 font-bold hover:text-emerald-700">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignUp
