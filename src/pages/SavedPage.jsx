import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useSaved } from '../context/SavedContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import ProductCard from '../components/storefront/ProductCard.jsx'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function SavedPage() {
  const { savedItems, loading } = useSaved()
  const { theme } = useSettings()
  const [products, setProducts] = useState([])
  const isDark = theme === 'dark'

  useEffect(() => {
    if (savedItems.length === 0) { setProducts([]); return }
    const ids = savedItems.map(i => i.product_id)
    supabase.from('products').select('*').in('id', ids).eq('is_active', true)
      .then(({ data }) => setProducts(data || []))
  }, [savedItems])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className={`text-3xl font-black uppercase mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
        <Heart className="text-brand-pink" /> Produtos Guardados
      </h1>

      {loading ? (
        <p className="text-center py-20 opacity-50">A carregar...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto mb-6 opacity-30" />
          <p className={`mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Nenhum produto guardado.</p>
          <Link to="/loja" className="inline-block bg-brand-pink text-white px-6 py-2 rounded-full text-sm font-bold uppercase">
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
