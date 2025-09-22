import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBVEvXZk3KhktI9Nk0R9BEVmHDpI6Clj4I",
  authDomain: "vikalp-ddc97.firebaseapp.com",
  projectId: "vikalp-ddc97",
  storageBucket: "vikalp-ddc97.firebasestorage.app",
  messagingSenderId: "607644768887",
  appId: "1:607644768887:web:07606a417c1d04b7958472"
};

// Initialize Firebase
let app, auth, db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.warn('Firebase initialization failed:', error)
  // Create mock objects for development
  app = null
  auth = null
  db = null
}

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Firebase Auth user
const [userData, setUserData] = useState({}); // Firestore fields

  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)

// -------------------- Sign up (email/password) --------------------
const signUp = async (email, password, firstName, lastName, role = 'user') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` })

  if (db) {
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName: `${firstName} ${lastName}`,
      role,  // 'user' or 'worker'
      createdAt: new Date().toISOString()
    })
  }

  return userCredential
}

// Sign in with role verification (safe for WorkerSignIn)
const signIn = async (email, password, role = null) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  if (db && role) {
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      // Only throw if role exists and is different from required role
      if (userData.role && userData.role !== role) {
        throw new Error('Invalid role for this account')
      }
      // If role is missing, we can auto-assign the role (optional)
      if (!userData.role) {
        await setDoc(
          doc(db, 'users', userCredential.user.uid),
          { role },
          { merge: true }
        )
      }
    } else {
      // User doc missing in Firestore — create it with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'No Name',
        role,
        createdAt: new Date().toISOString()
      })
    }
  }

  return userCredential
}


 

// -------------------- Google sign in with role --------------------
const signInWithGoogle = async (role = 'user') => {
  if (!auth) throw new Error('Authentication service not available')

  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  const { user } = userCredential

  if (db) {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    // If user exists, check role
    if (userDoc.exists()) {
      const existingRole = userDoc.data().role
      if (role && existingRole !== role) {
        throw new Error(`Google account already registered as ${existingRole}`)
      }
    } else {
      // New user: save to Firestore with role
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'No Name',
        role, // user or worker
        createdAt: new Date().toISOString()
      })
    }
  }

  return userCredential
}



  // Admin sign in with hardcoded credentials
  const adminSignIn = async (email, password) => {
    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'parascursor9@gmail.com'
    const ADMIN_PASSWORD = 'Up12k0143@'
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = {
        email: ADMIN_EMAIL,
        role: 'admin',
        displayName: 'Admin User',
        uid: 'admin-user-id'
      }
      setAdminUser(adminData)
      localStorage.setItem('adminUser', JSON.stringify(adminData))
      return adminData
    } else {
      throw new Error('Invalid admin credentials')
    }
  }

  // Admin sign out
  const adminLogout = () => {
    setAdminUser(null)
    localStorage.removeItem('adminUser')
  }

  // Sign out
  const logout = () => {
    if (!auth) {
      return Promise.resolve()
    }
    return signOut(auth)
  }

 // Inside useEffect for onAuthStateChanged
useEffect(() => {
  const savedAdminUser = localStorage.getItem('adminUser')
  if (savedAdminUser) {
    try {
      setAdminUser(JSON.parse(savedAdminUser))
    } catch (error) {
      console.error('Error parsing admin user data:', error)
      localStorage.removeItem('adminUser')
    }
  }

  if (!auth) {
    setLoading(false)
    return
  }

const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    let enrichedUser = firebaseUser; // Start with Firebase User

    if (db) {
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          // Merge Firestore data directly
          Object.assign(enrichedUser, userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching Firestore user data:", error);
      }
    }

    // Keep getIdToken always accessible
    enrichedUser.getIdToken = firebaseUser.getIdToken.bind(firebaseUser);

    setUser(enrichedUser);
  } else {
    setUser(null);
  }

  setLoading(false);
});




  return unsubscribe
}, [])


  const value = {
    user,
    adminUser,
    signUp,
    signIn,
    signInWithGoogle,
    adminSignIn,
    adminLogout,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {!loading && !auth && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
          <strong>Demo Mode:</strong> Firebase not configured. Authentication features are disabled.
        </div>
      )}
    </AuthContext.Provider>
  )
}
