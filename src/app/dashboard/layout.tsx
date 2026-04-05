'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Calendar,
  Copy
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trabajadores', href: '/dashboard/trabajadores', icon: Users },
  { name: 'Evaluaciones', href: '/dashboard/evaluaciones', icon: FileText },
  { name: 'Ciclos', href: '/dashboard/ciclos', icon: Calendar },
  { name: 'Plantillas', href: '/dashboard/plantillas', icon: Copy },
  { name: 'Reportes', href: '/dashboard/reportes', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      const { AuthService } = await import('@/services/auth')
      await AuthService.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">SEACORP PERÚ</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700">
          <div className="flex items-center h-16 px-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">SEACORP PERÚ</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-slate-200 shadow-sm lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="text-slate-900">
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold text-slate-900">SEACORP PERÚ</h1>
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
