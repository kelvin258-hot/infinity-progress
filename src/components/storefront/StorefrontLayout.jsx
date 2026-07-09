import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Sun, Moon, ShoppingBag, Heart, Search } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { useSaved } from '../../context/SavedContext.jsx'
import { supabase } from '../../lib/supabase'
import SavedDrawer from './SavedDrawer.jsx'
import Footer from './Footer.jsx'

export default function StorefrontLayout() {
  const { cartCount } = useCart()
  const { theme, toggleTheme, settings } = useSettings()
  const { savedItems } = useSaved()
  const [menuOpen, setMenuOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [copyrightClicks, setCopyrightClicks] = useState(0)
  const [showAdminBtn, setShowAdminBtn] = useState(false)
  const clickTimer = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  const handleCopyrightClick = () => {
    const clicks = copyrightClicks + 1
    setCopyrightClicks(clicks)
    if (clicks >= 3) {
      setShowAdminBtn(true)
      setCopyrightClicks(0)
      setTimeout(() => setShowAdminBtn(false), 10000)
    } else {
      clearTimeout(clickTimer.current)
      clickTimer.current = setTimeout(() => setCopyrightClicks(0), 1000)
    }
  }

  const profileImage = settings?.profile_image_url

  return (
    <div className="min-h-screen flex flex-col">
      {/* Promo bar */}
      {settings?.promo_active && settings?.promo_text && (
        <div className="bg-brand-pink text-white text-center py-2 text-xs font-bold uppercase tracking-wide px-4">
          {settings.promo_text}
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        theme === 'dark'
          ? 'bg-black/80 border-white/10'
          : 'bg-white/90 border-gray-200'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: hamburger for saved items */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSavedOpen(true)}
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
              aria-label="Guardados"
            >
              <Menu size={22} />
              {savedItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {savedItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Center: Logo / Profile */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Infinity Progress"
                className={`w-10 h-10 object-contain ${settings?.profile_rotate ? 'animate-spin-slow' : ''}`}
              />
            ) : (
              <span className={`text-xl font-black uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Infinity Progress
              </span>
            )}
          </Link>

          {/* Right: theme toggle + cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={20} className="text-brand-pink" /> : <Moon size={20} className="text-brand-blue" />}
            </button>
            <Link
              to="/carrinho"
              className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Category nav */}
        <div className={`border-t px-4 sm:px-6 py-2 flex items-center gap-4 overflow-x-auto ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        }`}>
          <Link to="/" className={`text-xs uppercase tracking-wide whitespace-nowrap font-medium hover:text-brand-pink transition-colors ${
            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
          }`}>Início</Link>
          <Link to="/loja" className={`text-xs uppercase tracking-wide whitespace-nowrap font-medium hover:text-brand-pink transition-colors ${
            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
          }`}>Tudo</Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/loja/${cat.slug}`}
              className={`text-xs uppercase tracking-wide whitespace-nowrap font-medium hover:text-brand-pink transition-colors ${
                theme === 'dark' ? 'text-white/80' : 'text-gray-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer onCopyrightClick={handleCopyrightClick} showAdminBtn={showAdminBtn} />

      <SavedDrawer open={savedOpen} onClose={() => setSavedOpen(false)} />
    </div>
  )
}
