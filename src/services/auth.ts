import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name: string
  role?: string
}

export class AuthService {
  static async signIn(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async signUp(credentials: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          role: credentials.role || 'evaluador',
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name,
      role: user.user_metadata?.role,
    }
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      throw new Error(error.message)
    }
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role,
        })
      } else {
        callback(null)
      }
    })
  }
}
