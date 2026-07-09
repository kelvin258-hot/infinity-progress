import { useState, useEffect } from 'react'
import { Package, Tags, Image, ShoppingCart, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, banners: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('banners').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*'),
    ]).then(([p, c, b, o]) => {
      const orders = o.data || []
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
      setStats({
        products: p.count || 0,
        categories: c.count || 0,
        banners: b.count || 0,
        orders: orders.length,
        revenue,
      })
    })
  }, [])

  const cards = [
    { label: 'Produtos', value: stats.products, icon: Package, color: 'bg-brand-pink' },
    { label: 'Categorias', value: stats.categories, icon: Tags, color: 'bg-brand-blue' },
    { label: 'Banners', value: stats.banners, icon: Image, color: 'bg-purple-600' },
    { label: 'Encomendas', value: stats.orders, icon: ShoppingCart, color: 'bg-green-600' },
    { label: 'Receita (MZN)', value: stats.revenue.toFixed(0), icon: TrendingUp, color: 'bg-orange-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black uppercase mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={24} className="text-white" />
            </div>
            <p className="text-3xl font-black">{card.value}</p>
            <p className="text-sm text-white/50 uppercase tracking-wide mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">Bem-vindo à área de administração</h2>
        <p className="text-white/60 text-sm">
          Use o menu à esquerda para gerir produtos, categorias, banners, encomendas, fontes de letra,
          perfil do site e configurações.
        </p>
      </div>
    </div>
  )
}
