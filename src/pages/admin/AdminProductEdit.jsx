import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, X, Plus, Lock, Calendar } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../../lib/supabase'
import { slugify } from '../../lib/utils'

export default function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [product, setProduct] = useState({
    name: '', description: '', price: 0, category_id: null,
    is_active: true, is_featured: false, is_drop: false, drop_date: '',
    stock_display: 0, show_stock: true,
  })
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [variants, setVariants] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    const [catRes, sizeRes, colorRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('sizes').select('*').order('sort_order'),
      supabase.from('colors').select('*'),
    ])
    setCategories(catRes.data || [])
    setSizes(sizeRes.data || [])
    setColors(colorRes.data || [])

    if (!isNew) {
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
      if (prod) {
        setProduct({
          ...prod,
          drop_date: prod.drop_date ? new Date(prod.drop_date).toISOString().slice(0, 16) : '',
        })
        const [imgRes, varRes] = await Promise.all([
          supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
          supabase.from('product_variants').select('*, size:sizes(*), color:colors(*)').eq('product_id', id),
        ])
        setImages(imgRes.data || [])
        setVariants(varRes.data || [])
      }
    }
  }, [id, isNew])

  useEffect(() => { loadData() }, [loadData])

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)

    const uploaded = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
      if (!error) {
        const { data: url } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
        uploaded.push({ image_url: url.publicUrl, sort_order: images.length + uploaded.length })
      }
    }

    if (!isNew && uploaded.length > 0) {
      await supabase.from('product_images').insert(uploaded.map(img => ({ ...img, product_id: id })))
      loadData()
    } else {
      setImages(prev => [...prev, ...uploaded])
    }
    setUploading(false)
  }

  const removeImage = async (imageId, index) => {
    if (imageId) {
      await supabase.from('product_images').delete().eq('id', imageId)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleVariant = (sizeId, colorId) => {
    const exists = variants.find(v => v.size_id === sizeId && v.color_id === colorId)
    if (exists) {
      setVariants(prev => prev.filter(v => v !== exists))
    } else {
      setVariants(prev => [...prev, { size_id: sizeId, color_id: colorId, stock: 0 }])
    }
  }

  const updateVariantStock = (index, stock) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, stock: parseInt(stock) || 0 } : v))
  }

  const handleSave = async () => {
    setSaving(true)
    const productData = {
      ...product,
      price: parseFloat(product.price) || 0,
      stock_display: parseInt(product.stock_display) || 0,
      drop_date: product.is_drop && product.drop_date ? new Date(product.drop_date).toISOString() : null,
    }

    let productId = id
    if (isNew) {
      const { data, error } = await supabase.from('products').insert(productData).select().maybeSingle()
      if (data) productId = data.id
    } else {
      await supabase.from('products').update({ ...productData, updated_at: new Date().toISOString() }).eq('id', id)
    }

    // Save images (for new products)
    if (isNew && images.length > 0) {
      await supabase.from('product_images').insert(images.map((img, i) => ({
        ...img, product_id: productId, is_primary: i === 0,
      })))
    }

    // Save variants
    if (!isNew) {
      // Delete existing and re-insert
      await supabase.from('product_variants').delete().eq('product_id', productId)
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(variants.map(v => ({
          product_id: productId,
          size_id: v.size_id,
          color_id: v.color_id,
          stock: v.stock || 0,
        })))
      }
    }

    setSaving(false)
    navigate('/admin/produtos')
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link to="/admin/produtos" className="flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm">
        <ArrowLeft size={18} /> Voltar aos Produtos
      </Link>

      <h1 className="text-3xl font-black uppercase mb-8">
        {isNew ? 'Novo Produto' : 'Editar Produto'}
      </h1>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Informação Básica</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/60 mb-1 block">Nome do Produto</label>
              <input
                type="text"
                value={product.name}
                onChange={e => setProduct({ ...product, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-1 block">Descrição</label>
              <textarea
                value={product.description}
                onChange={e => setProduct({ ...product, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/60 mb-1 block">Preço (MZN)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={e => setProduct({ ...product, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/60 mb-1 block">Categoria</label>
                <select
                  value={product.category_id || ''}
                  onChange={e => setProduct({ ...product, category_id: e.target.value || null })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
                >
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Imagens do Produto</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id, i)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-brand-pink transition-colors">
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
              {uploading ? (
                <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={24} className="text-white/40" />
              )}
            </label>
          </div>
          <p className="text-xs text-white/40">Carregue imagens da sua galeria. A primeira imagem será a principal.</p>
        </div>

        {/* Stock */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Stock</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={product.show_stock}
                onChange={e => setProduct({ ...product, show_stock: e.target.checked })}
                className="w-5 h-5 accent-brand-pink"
              />
              <label className="text-sm">Mostrar stock aos clientes</label>
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-1 block">Peças Disponíveis (visível aos clientes)</label>
              <input
                type="number"
                value={product.stock_display}
                onChange={e => setProduct({ ...product, stock_display: e.target.value })}
                className="w-32 px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              />
              <p className="text-xs text-white/40 mt-1">Este número diminui automaticamente com cada encomenda. Pode redefinir a qualquer momento.</p>
            </div>
          </div>
        </div>

        {/* Variants (size/color) */}
        {!isNew && (
          <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Variantes (Tamanho / Cor)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-2">Selecione as combinações disponíveis:</h3>
                <div className="overflow-x-auto admin-scroll">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/50 text-xs uppercase">
                        <th className="p-2 text-left">Tamanho</th>
                        <th className="p-2 text-left">Cor</th>
                        <th className="p-2 text-left">Stock</th>
                        <th className="p-2 text-left">Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map(size => colors.map(color => {
                        const variant = variants.find(v => v.size_id === size.id && v.color_id === color.id)
                        const vIndex = variants.indexOf(variant)
                        return (
                          <tr key={`${size.id}-${color.id}`} className="border-t border-white/5">
                            <td className="p-2">{size.name}</td>
                            <td className="p-2">
                              <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex_code }} />
                                {color.name}
                              </span>
                            </td>
                            <td className="p-2">
                              {variant && (
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={e => updateVariantStock(vIndex, e.target.value)}
                                  className="w-20 px-2 py-1 rounded bg-white/10 border border-white/10"
                                />
                              )}
                            </td>
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={!!variant}
                                onChange={() => toggleVariant(size.id, color.id)}
                                className="w-5 h-5 accent-brand-pink"
                              />
                            </td>
                          </tr>
                        )
                      }))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drop / Countdown */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock size={20} /> Drop / Lançamento Programado
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={product.is_drop}
                onChange={e => setProduct({ ...product, is_drop: e.target.checked })}
                className="w-5 h-5 accent-brand-pink"
              />
              <label className="text-sm">Ativar como Drop (produto bloqueado até à data de lançamento)</label>
            </div>
            {product.is_drop && (
              <div>
                <label className="text-sm font-medium text-white/60 mb-1 block flex items-center gap-2">
                  <Calendar size={16} /> Data e Hora de Lançamento
                </label>
                <input
                  type="datetime-local"
                  value={product.drop_date}
                  onChange={e => setProduct({ ...product, drop_date: e.target.value })}
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
                />
                <p className="text-xs text-white/40 mt-1">
                  O produto aparecerá desfocado para os clientes até esta data. Uma contagem decrescente será mostrada.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Status</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={product.is_active}
                onChange={e => setProduct({ ...product, is_active: e.target.checked })}
                className="w-5 h-5 accent-brand-pink"
              />
              <label className="text-sm">Produto ativo (visível na loja)</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={product.is_featured}
                onChange={e => setProduct({ ...product, is_featured: e.target.checked })}
                className="w-5 h-5 accent-brand-pink"
              />
              <label className="text-sm">Destacar na página inicial</label>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !product.name}
          className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'A guardar...' : 'Guardar Produto'}
        </button>
      </div>
    </div>
  )
}
