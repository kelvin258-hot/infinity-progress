import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { LayoutDashboard, Package, Tags, Image, Share2, ShoppingCart, Settings, Type, User, LogOut, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { supabase } from '../../lib/supabase'

export default function AdminLayout() {
  const { session, signOut, loading } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [locked, setLocked] = useState(false)
  const lockTimerRef = useRef(null)
  const lockSeconds = settings?.admin_lock_seconds || 1

  const startLockTimer = useCallback(() => {
    clearTimeout(lockTimerRef.current)
    if (lockSeconds === 0) return
    lockTimerRef.current = setTimeout(() => {
      setLocked(true)
    }, lockSeconds * 1000)
  }, [lockSeconds])

  // Lock when leaving admin area (visibility change)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        startLockTimer()
      } else {
        clearTimeout(lockTimerRef.current)
        if (locked) {
          // If we come back and it's locked, redirect to login
          signOut()
          navigate('/admin/login')
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [locked, signOut, navigate, startLockTimer])

  // Also lock on blur (switching tabs/apps)
  useEffect(() => {
    const handleBlur = () => startLockTimer()
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [startLockTimer])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/produtos', icon: Package, label: 'Produtos' },
    { to: '/admin/categorias', icon: Tags, label: 'Categorias' },
    { to: '/admin/banners', icon: Image, label: 'Banners' },
    { to: '/admin/redes-sociais', icon: Share2, label: 'Redes Sociais' },
    { to: '/admin/encomendas', icon: ShoppingCart, label: 'Encomendas' },
    { to: '/admin/fontes', icon: Type, label: 'Fontes de Letra' },
    { to: '/admin/perfil', icon: User, label: 'Perfil do Site' },
    { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-white/10 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          {settings?.profile_image_url ? (
            <img
              src={settings.profile_image_url}
              alt="Infinity Progress"
              className={`w-12 h-12 object-contain mb-2 ${settings?.profile_rotate ? 'animate-spin-slow' : ''}`}
            />
          ) : null}
          <h1 className="text-lg font-black uppercase">Infinity Progress</h1>
          <p className="text-xs text-white/40 uppercase tracking-wide">Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 admin-scroll">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-pink text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => { signOut(); navigate('/admin/login') }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} /> Sair
          </button>
          <NavLink
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LayoutDashboard size={18} /> Ver Site
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto h-screen admin-scroll">
        <Outlet />
      </main>
    </div>
  )
}
