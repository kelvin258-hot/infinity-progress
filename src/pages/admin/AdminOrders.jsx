import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [items, setItems] = useState([])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const viewOrder = async (order) => {
    setSelectedOrder(order)
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setItems(data || [])
  }

  const updateStatus = async (orderId, field, value) => {
    await supabase.from('orders').update({ [field]: value }).eq('id', orderId)
    load()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, [field]: value })
    }
  }

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    pending: 'bg-orange-500/20 text-orange-400',
    paid: 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black uppercase mb-8">Encomendas</h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg">Nenhuma encomenda recebida ainda.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders list */}
          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => viewOrder(order)}
                className={`bg-neutral-900 rounded-2xl p-4 border cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id ? 'border-brand-pink' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{order.order_number}</span>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${statusColors[order.order_status] || statusColors.new}`}>
                    {order.order_status}
                  </span>
                </div>
                <p className="text-sm text-white/60">{order.customer_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-brand-pink font-bold">{formatPrice(order.total)}</span>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${statusColors[order.payment_status] || statusColors.pending}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order detail */}
          {selectedOrder && (
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 h-fit sticky top-4">
              <h2 className="text-xl font-bold mb-4">Encomenda {selectedOrder.order_number}</h2>
              <div className="space-y-2 text-sm mb-4">
                <p><span className="text-white/40">Cliente:</span> {selectedOrder.customer_name}</p>
                <p><span className="text-white/40">Telefone:</span> {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p><span className="text-white/40">Email:</span> {selectedOrder.customer_email}</p>}
                {selectedOrder.shipping_address && <p><span className="text-white/40">Endereço:</span> {selectedOrder.shipping_address}</p>}
                <p><span className="text-white/40">Pagamento:</span> {selectedOrder.payment_method}</p>
                {selectedOrder.notes && <p><span className="text-white/40">Notas:</span> {selectedOrder.notes}</p>}
              </div>

              <h3 className="font-bold mb-2 text-sm uppercase">Itens</h3>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <div>
                      <p>{item.product_name}</p>
                      <p className="text-xs text-white/40">
                        {item.size_name && `Tam: ${item.size_name}`}
                        {item.size_name && item.color_name && ' · '}
                        {item.color_name && `Cor: ${item.color_name}`}
                        {' · '}x{item.quantity}
                      </p>
                    </div>
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span className="text-brand-pink">{formatPrice(selectedOrder.total)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 uppercase mb-1 block">Status da Encomenda</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={e => updateStatus(selectedOrder.id, 'order_status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
                  >
                    <option value="new">Nova</option>
                    <option value="processing">A processar</option>
                    <option value="shipped">Enviada</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase mb-1 block">Status do Pagamento</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={e => updateStatus(selectedOrder.id, 'payment_status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
