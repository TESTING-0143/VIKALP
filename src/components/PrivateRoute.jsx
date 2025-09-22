import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * role: 'user' | 'worker' | 'admin'
 * children: component to render if authorized
 */
function PrivateRoute({ children, role }) {
  const { user, adminUser, loading } = useAuth()

  if (loading) return null // or a loader

  // Admin route
  if (role === 'admin') {
    if (!adminUser) return <Navigate to="/admin-signin" replace />
    return children
  }

  // User/Worker route
  if (role === 'user') {
    if (!user || user.role !== 'user') return <Navigate to="/signin" replace />
    return children
  }

  if (role === 'worker') {
    if (!user || user.role !== 'worker') return <Navigate to="/worker-signin" replace />
    return children
  }

  return children
}

export default PrivateRoute
