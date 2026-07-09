import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { formatPrice } from '../lib/utils'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const { theme } = useSettings()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-6 opacity-30" />
        <h1 className={`text-2xl font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Carrinho Vazio</h1>
        <p className={`mb-8 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Ainda não adicionou nenhum produto ao carrinho.</p>
        <Link to="/loja" className="inline-block bg-brand-pink hover:bg-brand-pinkDark text-white px-8 py-3 rounded-full font-bold uppercase text-sm transition-colors">
          Ver Produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className={`text-3xl font-black uppercase mb-8 ${isDark ? 'text-white' : 'text-black'}`}>Carrinho</h1>

      <div className="space-y-4 mb-8">
        {cart.map((item, i) => (
          <div key={i} className={`flex gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            {item.image && (
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{item.name}</h3>
              {item.size && <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Tamanho: {item.size}</p>}
              {item.color && <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Cor: {item.color}</p>}
              <p className="text-brand-pink font-bold text-sm mt-1">{formatPrice(item.price)}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(i, item.quantity - 1)} className={`w-7 h-7 rounded ${isDark ? 'bg-white/10' : 'bg-gray-300'} font-bold`}>-</button>
                  <span className="text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(i, item.quantity + 1)} className={`w-7 h-7 rounded ${isDark ? 'bg-white/10' : 'bg-gray-300'} font-bold`}>+</button>
                </div>
                <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-500 ml-auto">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold uppercase">Total</span>
          <span className="text-2xl font-black text-brand-pink">{formatPrice(cartTotal)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors flex items-center justify-center gap-2"
        >
          Finalizar Compra <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
