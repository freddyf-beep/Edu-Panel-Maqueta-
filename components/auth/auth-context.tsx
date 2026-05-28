"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  blockedByAllowlist: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGoogleCalendar: () => Promise<void>
  signInWithGoogleDrive: () => Promise<void>
  logout: () => Promise<void>
  recheckAllowlist: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

const MOCK_USER: User = {
  uid: "mock-invitado-uid-12345",
  email: "invitado@edupanel.cl",
  displayName: "Freddy (Invitado)",
  photoURL: "/placeholder-user.jpg",
  emailVerified: true,
} as unknown as User

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializamos con el usuario mock para saltar el login de inmediato
  const [user, setUser] = useState<User | null>(MOCK_USER)
  const [loading, setLoading] = useState(false)
  const [blockedByAllowlist, setBlockedByAllowlist] = useState(false)

  useEffect(() => {
    // Mantener al usuario mock inicializado y apagar la carga
    setUser(MOCK_USER)
    setLoading(false)
    setBlockedByAllowlist(false)
  }, [])

  const signInWithGoogle = async () => {
    setLoading(true)
    setTimeout(() => {
      setUser(MOCK_USER)
      setBlockedByAllowlist(false)
      setLoading(false)
    }, 500)
  }

  const signInWithGoogleCalendar = async () => {
    // Mock de conexión de Calendar
    const { guardarGoogleCalendarToken } = await import("@/lib/google-calendar")
    guardarGoogleCalendarToken("mock-calendar-token-12345")
  }

  const signInWithGoogleDrive = async () => {
    // Mock de conexión de Drive
    const { guardarGoogleDriveToken } = await import("@/lib/google-drive")
    guardarGoogleDriveToken("mock-drive-token-12345")
  }

  const logout = async () => {
    setLoading(true)
    setTimeout(() => {
      setUser(null)
      setBlockedByAllowlist(false)
      setLoading(false)
    }, 500)
  }

  const recheckAllowlist = async () => {
    setBlockedByAllowlist(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, blockedByAllowlist, signInWithGoogle, signInWithGoogleCalendar, signInWithGoogleDrive, logout, recheckAllowlist }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
