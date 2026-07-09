import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { supabase } from '../lib/supabase'
import { formatPrice, generateOrderNumber } from '../lib/utils'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { theme, settings } = useSettings()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', paymentMethod: 'mpesa', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setSubmitting(true)

    const orderNum = generateOrderNumber()

    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNum,
      customer_name: form.name,
      customer_email: form.email || null,
      customer_phone: form.phone,
      shipping_address: form.address || null,
      total: cartTotal,
      payment_method: form.paymentMethod,
      notes: form.notes || null,
    }).select().maybeSingle()

    if (error) {
      setSubmitting(false)
      alert('Erro ao processar encomenda. Tente novamente.')
      return
    }

    // Insert order items
    if (order) {
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        size_name: item.size,
        color_name: item.color,
        quantity: item.quantity,
        price: item.price,
      }))
      await supabase.from('order_items').insert(items)

      // Decrement stock_display for each product (without showing to customers)
      for (const item of cart) {
        await supabase.rpc('decrement_stock', { product_id: item.productId, qty: item.quantity }).catch(() => {})
        // Fallback: direct update
        const { data: prod } = await supabase.from('products').select('stock_display').eq('id', item.productId).maybeSingle()
        if (prod) {
          await supabase.from('products').update({ stock_display: Math.max(0, prod.stock_display - item.quantity) }).eq('id', item.productId)
        }
      }
    }

    // Send WhatsApp notification to admin
    const adminMsg = `Nova Encomenda: ${orderNum}\nCliente: ${form.name}\nTelefone: ${form.phone}\nTotal: ${formatPrice(cartTotal)}\nPagamento: ${form.paymentMethod}`
    window.open(`https://wa.me/${settings?.whatsapp_number || '258873263515'}?text=${encodeURIComponent(adminMsg)}`, '_blank')

    clearCart()
    setOrderNumber(orderNum)
    setSubmitting(false)
  }

  if (orderNumber) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
        <h1 className={`text-3xl font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Encomenda Confirmada!
        </h1>
        <p className={`mb-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>O seu número de encomenda é:</p>
        <p className="text-2xl font-black text-brand-pink mb-6">{orderNumber}</p>
        <p className={`mb-8 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Entraremos em contacto para confirmar o pagamento e a entrega. Obrigado pela sua compra!
        </p>
        <Link to="/" className="inline-block bg-brand-pink hover:bg-brand-pinkDark text-white px-8 py-3 rounded-full font-bold uppercase text-sm transition-colors">
          Voltar ao Início
        </Link>
      </div>
    )
  }

  if (cart.length === 0) {
    navigate('/carrinho')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className={`text-3xl font-black uppercase mb-8 ${isDark ? 'text-white' : 'text-black'}`}>Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold uppercase mb-1 block">Nome Completo *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold uppercase mb-1 block">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold uppercase mb-1 block">Telefone *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+258 ..."
            className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold uppercase mb-1 block">Endereço de Entrega</label>
          <textarea
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            rows={3}
            className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}
          />
        </div>

        <div>
          <label className="text-sm font-bold uppercase mb-2 block">Método de Pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mpesa', label: 'M-Pesa' },
              { id: 'emola', label: 'E-Mola' },
              { id: 'card', label: 'Cartão' },
            ].map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setForm({ ...form, paymentMethod: method.id })}
                className={`py-3 rounded-xl text-sm font-bold uppercase border transition-colors ${
                  form.paymentMethod === method.id
                    ? 'bg-brand-pink text-white border-brand-pink'
                    : isDark ? 'border-white/20 text-white' : 'border-gray-300 text-black'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold uppercase mb-1 block">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}
          />
        </div>

        {/* Order summary */}
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          <h3 className="font-bold uppercase text-sm mb-3">Resumo</h3>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t border-white/10">
            <span>Total</span>
            <span className="text-brand-pink">{formatPrice(cartTotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors disabled:opacity-50"
        >
          {submitting ? 'A processar...' : 'Confirmar Encomenda'}
        </button>
      </form>
    </div>
  )
}
