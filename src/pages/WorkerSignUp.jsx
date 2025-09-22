import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEye,
  faEyeSlash,
  faSpinner,
  faUserPlus,
  faHardHat
} from '@fortawesome/free-solid-svg-icons'
import AuthStatus from '../components/AuthStatus'

const WorkerSignUp = () => {
  const { signUp, signInWithGoogle } = useAuth()
  const { showSuccess, showError } = useNotification()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!formData.email || !formData.password || !formData.confirmPassword) {
    showError('Please fill in all fields.')
    return
  }

  if (formData.password !== formData.confirmPassword) {
    showError('Passwords do not match.')
    return
  }

  setIsLoading(true)
  try {
    // Correct: firstName='Worker', lastName='', role='worker'
    await signUp(formData.email, formData.password, 'FirstName', 'LastName', 'worker')

    showSuccess('Worker account created successfully!')
    navigate('/worker-dashboard')
  } catch (error) {
    console.error('Worker sign up error:', error)
    switch (error.code) {
      case 'auth/email-already-in-use':
        showError('This email is already registered.')
        break
      case 'auth/invalid-email':
        showError('Invalid email address.')
        break
      case 'auth/weak-password':
        showError('Password should be at least 6 characters.')
        break
      default:
        showError('Failed to create worker account. Please try again.')
    }
  } finally {
    setIsLoading(false)
  }
}


  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle('worker')
      showSuccess('Signed up with Google successfully as a worker!')
      navigate('/worker-dashboard')
    } catch (error) {
      console.error('Google worker sign up error:', error)
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
            <div className="relative">
              <img src="/image3.webp" alt="Logo"
                className="h-12 w-12 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl blur opacity-30"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-black text-gray-800 tracking-wide font-heading">
                Clean and Healthy Area
              </span>
              <span className="text-gray-600 text-sm font-semibold">Worker Sign Up</span>
            </div>
          </div>
          <AuthStatus />
        </div>
      </header>

      {/* Main */}
      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-sm w-full">
          <div className="glass-card rounded-2xl shadow-card-lg p-6 border border-white/30 animate-fade-in">
            <div className="text-center mb-6">
              <FontAwesomeIcon icon={faHardHat} className="text-4xl text-orange-500 mb-3" />
              <h1 className="text-3xl font-black text-gray-800 mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Worker Portal
              </h1>
              <p className="text-gray-600 text-base">Create your worker account</p>
            </div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-white/90 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-gray-50 hover:border-gray-300 shadow-card flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-6 h-6" />
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 glass-effect text-gray-500 rounded-full">
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Worker Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 bg-white/80"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 bg-white/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                )}
                {isLoading ? 'Creating Account...' : 'Sign Up as Worker'}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have a worker account?{' '}
                <Link to="/worker-signin" className="text-orange-600 font-bold hover:text-orange-700">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Regular user?{' '}
                <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WorkerSignUp
