import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext.jsx'
import ProductCard from '../components/storefront/ProductCard.jsx'

export default function ShopPage() {
  const { category } = useParams()
  const { theme } = useSettings()
  const isDark = theme === 'dark'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data || []))
    supabase.from('sizes').select('*').order('sort_order')
      .then(({ data }) => setSizes(data || []))
    supabase.from('colors').select('*')
      .then(({ data }) => setColors(data || []))
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('is_active', true)

    if (category) {
      const cat = categories.find(c => c.slug === category)
      if (cat) query = query.eq('category_id', cat.id)
    }

    switch (sortBy) {
      case 'price-asc': query = query.order('price', { ascending: true }); break
      case 'price-desc': query = query.order('price', { ascending: false }); break
      case 'newest': query = query.order('created_at', { ascending: false }); break
      default: break
    }

    const { data } = await query
    let filtered = data || []

    if (priceRange.min) filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min))
    if (priceRange.max) filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max))

    if (selectedSizes.length > 0 || selectedColors.length > 0) {
      const productIds = filtered.map(p => p.id)
      const { data: variants } = await supabase
        .from('product_variants')
        .select('product_id, size_id, color_id')
        .in('product_id', productIds)

      const validIds = new Set()
      ;(variants || []).forEach(v => {
        const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(v.size_id)
        const colorMatch = selectedColors.length === 0 || selectedColors.includes(v.color_id)
        if (sizeMatch && colorMatch) validIds.add(v.product_id)
      })

      if (selectedSizes.length > 0 || selectedColors.length > 0) {
        filtered = filtered.filter(p => validIds.has(p.id))
      }
    }

    setProducts(filtered)
    setLoading(false)
  }, [category, sortBy, selectedSizes, selectedColors, priceRange, categories])

  useEffect(() => { loadProducts() }, [loadProducts])

  const toggleSize = (id) => {
    setSelectedSizes(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }
  const toggleColor = (id) => {
    setSelectedColors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const currentCat = categories.find(c => c.slug === category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className={`text-3xl font-black uppercase mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
        {currentCat ? currentCat.name : 'Todos os Produtos'}
      </h1>

      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-4 mb-6 flex-wrap`}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-0 cursor-pointer ${
              isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            <option value="newest">Novidades</option>
            <option value="price-asc">Preço: Menor para Maior</option>
            <option value="price-desc">Preço: Maior para Menor</option>
          </select>

          <div className={`flex rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-brand-pink text-white' : ''}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-brand-pink text-white' : ''}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className={`mb-6 p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sizes */}
            <div>
              <h4 className="text-sm font-bold uppercase mb-3">Tamanhos</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSize(s.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedSizes.includes(s.id)
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : isDark ? 'border-white/20 text-white' : 'border-gray-300 text-black'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-sm font-bold uppercase mb-3">Cores</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleColor(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedColors.includes(c.id)
                        ? 'border-brand-pink'
                        : isDark ? 'border-white/20' : 'border-gray-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex_code }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-sm font-bold uppercase mb-3">Preço (MZN)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  className={`w-24 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white text-black border border-gray-300'}`}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  className={`w-24 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white text-black border border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`aspect-[3/4] rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={`text-center py-20 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          <p className="text-lg">Nenhum produto encontrado.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
