import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  const toggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    loadProducts()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Tem a certeza que pretende eliminar este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Produtos</h1>
        <Link
          to="/admin/produtos/new"
          className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-3 rounded-full font-bold uppercase text-sm transition-colors"
        >
          <Plus size={18} /> Adicionar Produto
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg">Nenhum produto ainda.</p>
          <Link to="/admin/produtos/new" className="text-brand-pink mt-2 inline-block">Adicionar o primeiro produto</Link>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase text-white/50">
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-white/60">{p.category?.name || '—'}</td>
                    <td className="p-4 text-brand-pink font-bold">{formatPrice(p.price)}</td>
                    <td className="p-4">{p.stock_display}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`flex items-center gap-1 text-xs font-bold uppercase px-3 py-1 rounded-full ${
                          p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {p.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link to={`/admin/produtos/${p.id}`} className="p-2 hover:bg-white/10 rounded-lg">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
