'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, AuthUser } from '@/services/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }

        if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
