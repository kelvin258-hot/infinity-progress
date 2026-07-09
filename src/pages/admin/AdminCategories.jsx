import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../../lib/supabase'
import { slugify } from '../../lib/utils'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', image_url: '' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCategory = async () => {
    if (!newCat.name) return
    await supabase.from('categories').insert({
      name: newCat.name,
      slug: slugify(newCat.name),
      image_url: newCat.image_url || null,
    })
    setNewCat({ name: '', image_url: '' })
    setShowForm(false)
    load()
  }

  const toggleActive = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    load()
  }

  const deleteCategory = async (id) => {
    if (!confirm('Eliminar esta categoria?')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  const handleImageUpload = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `cat-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      setNewCat(prev => ({ ...prev, image_url: data.publicUrl }))
    }
  }

  const updateCategoryImage = async (catId, file) => {
    const ext = file.name.split('.').pop()
    const fileName = `cat-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      await supabase.from('categories').update({ image_url: data.publicUrl }).eq('id', catId)
      load()
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Categorias</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-3 rounded-full font-bold uppercase text-sm transition-colors"
        >
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-lg font-bold mb-4">Nova Categoria</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Nome</label>
              <input
                type="text"
                value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="ex: Chapéus, Blusões, Colares..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Imagem da Categoria</label>
              <div className="flex items-center gap-4">
                {newCat.image_url && (
                  <img src={newCat.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                  <Upload size={18} /> Carregar Imagem
                </label>
              </div>
            </div>
            <button
              onClick={addCategory}
              disabled={!newCat.name}
              className="bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-2 rounded-full font-bold uppercase text-sm disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-neutral-900 rounded-2xl p-4 border border-white/10">
              <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-white/5">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black">
                    {cat.name[0]}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{cat.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`p-2 rounded-lg ${cat.is_active ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {cat.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <label className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && updateCategoryImage(cat.id, e.target.files[0])} />
                    <Upload size={16} />
                  </label>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
