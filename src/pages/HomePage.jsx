import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext.jsx'
import ProductCard from '../components/storefront/ProductCard.jsx'

export default function HomePage() {
  const { theme, settings } = useSettings()
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const isDark = theme === 'dark'

  const loadData = useCallback(async () => {
    const [bannersRes, catsRes, productsRes] = await Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
    ])
    setBanners(bannersRes.data || [])
    setCategories(catsRes.data || [])
    setProducts(productsRes.data || [])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div>
      {/* Banner carousel */}
      {banners.length > 0 && (
        <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === currentBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full flex items-center">
                {/* Image on one side */}
                <div className="absolute inset-0">
                  <img src={banner.image_url} alt={banner.title || ''} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                </div>

                {/* Text on the other side */}
                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12">
                  <div className="max-w-lg">
                    {banner.subtitle && (
                      <p className="text-brand-pink text-sm font-bold uppercase tracking-widest mb-2">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.title && (
                      <h2
                        className="text-4xl sm:text-6xl font-black uppercase leading-none mb-6 text-white text-border"
                        style={{ fontFamily: 'var(--font-banners, "DM Sans")' }}
                      >
                        {banner.title}
                      </h2>
                    )}
                    {banner.button_text && (
                      <Link
                        to={banner.link_url || '/loja'}
                        className="inline-block bg-brand-pink hover:bg-brand-pinkDark text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide text-sm transition-transform hover:scale-105"
                      >
                        {banner.button_text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Banner controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-brand-pink transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-brand-pink transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentBanner ? 'w-8 bg-brand-pink' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2
            className={`text-3xl font-black uppercase tracking-wide mb-10 text-center ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'var(--font-categories, "DM Sans")' }}
          >
            Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/loja/${cat.slug}`}
                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full ${isDark ? 'bg-neutral-800' : 'bg-gray-200'} flex items-center justify-center`}>
                    <span className="text-4xl font-black uppercase opacity-20">{cat.name[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <span
                    className="text-xl font-black uppercase text-white text-border"
                    style={{ fontFamily: 'var(--font-categories, "DM Sans")' }}
                  >
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className={`text-3xl font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
            Novidades
          </h2>
          <Link to="/loja" className="flex items-center gap-2 text-brand-pink hover:text-brand-pinkDark transition-colors text-sm font-bold uppercase">
            Ver Tudo <ArrowRight size={16} />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            <p className="text-lg">Nenhum produto disponível de momento.</p>
            <p className="text-sm mt-2">Volte em breve para conferir as novidades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
