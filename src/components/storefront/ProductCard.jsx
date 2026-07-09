import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, Lock, ShoppingBag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSaved } from '../../context/SavedContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { formatPrice, getTimeRemaining } from '../../lib/utils'

export default function ProductCard({ product }) {
  const { isSaved, toggleSave } = useSaved()
  const { theme, settings } = useSettings()
  const [primaryImage, setPrimaryImage] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', product.id)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPrimaryImage(data?.image_url || null))
  }, [product.id])

  // Countdown for drop products
  useEffect(() => {
    if (!product.is_drop || !product.drop_date) return
    const update = () => {
      const remaining = getTimeRemaining(product.drop_date)
      setCountdown(remaining)
    }
    update()
    const interval = setInterval(update, 10)
    return () => clearInterval(interval)
  }, [product.is_drop, product.drop_date])

  const isLocked = product.is_drop && product.drop_date && countdown && countdown.total > 0
  const saved = isSaved(product.id)
  const stockDisplay = product.stock_display
  const outOfStock = stockDisplay !== null && stockDisplay !== undefined && stockDisplay <= 0

  return (
    <div className="product-card relative rounded-2xl overflow-hidden group">
      <Link to={`/produto/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover ${isLocked ? 'drop-blur' : ''}`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`}>
              <ShoppingBag size={32} className="opacity-30" />
            </div>
          )}

          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <Lock size={28} className="text-white mb-2" />
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">Bloqueado</p>
              <div className="font-mono text-white text-sm font-bold tabular-nums">
                {String(countdown.days).padStart(2, '0')}d : {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s : {String(countdown.centiseconds).padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Out of stock badge */}
          {outOfStock && !isLocked && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
              Esgotado
            </div>
          )}

          {/* Stock count */}
          {product.show_stock && !outOfStock && !isLocked && stockDisplay > 0 && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
              {stockDisplay} peças disponíveis
            </div>
          )}

          {/* Save button */}
          {!isLocked && (
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleSave(product.id)
              }}
              className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                saved ? 'bg-brand-pink text-white' : 'bg-black/50 text-white hover:bg-brand-pink'
              }`}
              aria-label="Guardar"
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/produto/${product.id}`}>
          <h3
            className="font-bold text-sm truncate"
            style={{ fontFamily: 'var(--font-products, "DM Sans")' }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-brand-pink font-bold text-sm">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  )
}
