import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, ShoppingBag, MessageCircle, ChevronLeft, ZoomIn, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext.jsx'
import { useSaved } from '../context/SavedContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { formatPrice, getTimeRemaining } from '../lib/utils'
import ProductCard from '../components/storefront/ProductCard.jsx'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isSaved, toggleSave } = useSaved()
  const { theme, settings } = useSettings()
  const isDark = theme === 'dark'

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [countdown, setCountdown] = useState(null)
  const [showZoom, setShowZoom] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const loadProduct = useCallback(async () => {
    const { data: prod } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
    if (!prod) { setLoading(false); return }
    setProduct(prod)

    const [imgRes, varRes, sizeRes, colorRes] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
      supabase.from('product_variants').select('*, size:sizes(*), color:colors(*)').eq('product_id', id),
      supabase.from('sizes').select('*').order('sort_order'),
      supabase.from('colors').select('*'),
    ])
    setImages(imgRes.data || [])
    setVariants(varRes.data || [])
    setSizes(sizeRes.data || [])
    setColors(colorRes.data || [])

    // Related products
    if (prod.category_id) {
      const { data: rel } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', prod.category_id)
        .neq('id', id)
        .limit(4)
      setRelated(rel || [])
    }

    setLoading(false)
  }, [id])

  useEffect(() => { loadProduct() }, [loadProduct])

  // Countdown for drops
  useEffect(() => {
    if (!product?.is_drop || !product?.drop_date) return
    const update = () => setCountdown(getTimeRemaining(product.drop_date))
    update()
    const interval = setInterval(update, 10)
    return () => clearInterval(interval)
  }, [product])

  // Scroll to top on load
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-xl">Produto não encontrado.</p>
        <Link to="/loja" className="text-brand-pink mt-4 inline-block">Voltar à loja</Link>
      </div>
    )
  }

  const isLocked = product.is_drop && product.drop_date && countdown && countdown.total > 0
  const saved = isSaved(product.id)
  const outOfStock = product.stock_display <= 0

  const availableSizes = [...new Set(variants.map(v => v.size_id).filter(Boolean))]
  const availableColors = [...new Set(variants.map(v => v.color_id).filter(Boolean))]

  const handleAddToCart = () => {
    if (isLocked || outOfStock) return
    const sizeName = sizes.find(s => s.id === selectedSize)?.name || null
    const colorName = colors.find(c => c.id === selectedColor)?.name || null
    addToCart(product, sizeName, colorName, quantity)
    navigate('/carrinho')
  }

  const handleWhatsAppBuy = () => {
    if (isLocked || outOfStock) return
    const sizeName = sizes.find(s => s.id === selectedSize)?.name || 'N/A'
    const colorName = colors.find(c => c.id === selectedColor)?.name || 'N/A'
    const msg = `Olá! Quero encomendar:\n\n*${product.name}*\nPreço: ${formatPrice(product.price)}\nTamanho: ${sizeName}\nCor: ${colorName}\nQuantidade: ${quantity}\n\nTotal: ${formatPrice(product.price * quantity)}`
    window.open(`https://wa.me/${settings?.whatsapp_number || '258873263515'}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.description, url })
      } catch {}
    } else {
      setShareOpen(!shareOpen)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copiado!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/" className={isDark ? 'text-white/60 hover:text-brand-pink' : 'text-gray-500 hover:text-brand-pink'}>Início</Link>
        <span className="opacity-30">/</span>
        <Link to="/loja" className={isDark ? 'text-white/60 hover:text-brand-pink' : 'text-gray-500 hover:text-brand-pink'}>Loja</Link>
        <span className="opacity-30">/</span>
        <span className={isDark ? 'text-white' : 'text-black'}>{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.image_url}
                alt={product.name}
                className={`w-full h-full object-cover ${isLocked ? 'drop-blur' : ''} cursor-zoom-in`}
                onClick={() => !isLocked && setShowZoom(true)}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`}>
                <ShoppingBag size={48} className="opacity-30" />
              </div>
            )}
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <Lock size={36} className="text-white mb-3" />
                <p className="text-white text-sm font-bold uppercase tracking-wider mb-3">Bloqueado</p>
                <div className="font-mono text-white text-lg font-bold tabular-nums">
                  {String(countdown.days).padStart(2, '0')}d : {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s : {String(countdown.centiseconds).padStart(2, '0')}
                </div>
              </div>
            )}
            {!isLocked && images.length > 0 && (
              <button
                onClick={() => setShowZoom(true)}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-brand-pink transition-colors"
              >
                <ZoomIn size={20} />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && !isLocked && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-brand-pink' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1
            className={`text-3xl font-black uppercase mb-2 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'var(--font-products, "DM Sans")' }}
          >
            {product.name}
          </h1>
          <p className="text-2xl text-brand-pink font-bold mb-4">{formatPrice(product.price)}</p>

          {/* Stock display */}
          {product.show_stock && (
            <div className="mb-4">
              {outOfStock ? (
                <span className="inline-block bg-red-600 text-white text-sm font-bold uppercase px-4 py-1.5 rounded-full">
                  Esgotado
                </span>
              ) : (
                <span className={`inline-block text-sm font-bold uppercase px-4 py-1.5 rounded-full ${
                  isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-black'
                }`}>
                  {product.stock_display} peças disponíveis
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              {product.description}
            </div>
          )}

          {/* Size selection */}
          {!isLocked && availableSizes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold uppercase mb-2">Tamanho</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.filter(s => availableSizes.includes(s.id)).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.id)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      selectedSize === s.id
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : isDark ? 'border-white/20 text-white hover:border-brand-pink' : 'border-gray-300 text-black hover:border-brand-pink'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {!isLocked && availableColors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold uppercase mb-2">Cor</h4>
              <div className="flex flex-wrap gap-2">
                {colors.filter(c => availableColors.includes(c.id)).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    disabled={isLocked}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedColor === c.id ? 'border-brand-pink' : isDark ? 'border-white/20' : 'border-gray-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c.hex_code }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {!isLocked && !outOfStock && (
            <div className="mb-6">
              <h4 className="text-sm font-bold uppercase mb-2">Quantidade</h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className={`w-10 h-10 rounded-lg font-bold text-lg ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                >-</button>
                <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                >+</button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isLocked && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {outOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}
                </button>
                <button
                  onClick={() => toggleSave(product.id)}
                  className={`p-3 rounded-full transition-colors ${
                    saved ? 'bg-brand-pink text-white' : isDark ? 'bg-white/10 text-white hover:bg-brand-pink' : 'bg-gray-200 text-black hover:bg-brand-pink'
                  }`}
                >
                  <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-brand-pink' : 'bg-gray-200 text-black hover:bg-brand-pink'}`}
                  >
                    <Share2 size={20} />
                  </button>
                  {shareOpen && (
                    <div className={`absolute right-0 top-12 z-30 p-4 rounded-2xl shadow-xl ${isDark ? 'bg-neutral-800' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex flex-col gap-2 w-48">
                        <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, '_blank'); }} className="flex items-center gap-2 text-sm hover:text-brand-pink">
                          <MessageCircle size={16} /> WhatsApp
                        </button>
                        <button onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank'); }} className="flex items-center gap-2 text-sm hover:text-brand-pink">
                          <span className="w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded font-bold">f</span> Facebook
                        </button>
                        <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}`, '_blank'); }} className="flex items-center gap-2 text-sm hover:text-brand-pink">
                          <span className="w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded font-bold">X</span> Twitter / X
                        </button>
                        <button onClick={copyLink} className="flex items-center gap-2 text-sm hover:text-brand-pink">
                          <Share2 size={16} /> Copiar Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleWhatsAppBuy}
                disabled={outOfStock}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle size={18} /> Comprar via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className={`text-2xl font-black uppercase mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Produtos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Zoom modal */}
      {showZoom && images[selectedImage] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowZoom(false)}>
          <img src={images[selectedImage].image_url} alt={product.name} className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setShowZoom(false)}>✕</button>
        </div>
      )}
    </div>
  )
}
