import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../../lib/supabase'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image_url: '', link_url: '', button_text: '' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('sort_order')
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      setNewBanner(prev => ({ ...prev, image_url: data.publicUrl }))
    }
  }

  const addBanner = async () => {
    if (!newBanner.image_url) { alert('Carregue uma imagem primeiro.'); return }
    await supabase.from('banners').insert({
      title: newBanner.title || null,
      subtitle: newBanner.subtitle || null,
      image_url: newBanner.image_url,
      link_url: newBanner.link_url || null,
      button_text: newBanner.button_text || null,
    })
    setNewBanner({ title: '', subtitle: '', image_url: '', link_url: '', button_text: '' })
    setShowForm(false)
    load()
  }

  const toggleActive = async (banner) => {
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    load()
  }

  const deleteBanner = async (id) => {
    if (!confirm('Eliminar este banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    load()
  }

  const updateBanner = async (id, field, value) => {
    await supabase.from('banners').update({ [field]: value }).eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Banners</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-3 rounded-full font-bold uppercase text-sm transition-colors"
        >
          <Plus size={18} /> Novo Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-lg font-bold mb-4">Novo Banner</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Imagem</label>
              <div className="flex items-center gap-4">
                {newBanner.image_url && <img src={newBanner.image_url} alt="" className="w-32 h-20 rounded-xl object-cover" />}
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
                  <Upload size={18} /> Carregar
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Título (ex: Nova Coleção)</label>
                <input type="text" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Subtítulo</label>
                <input type="text" value={newBanner.subtitle} onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Texto do Botão (ex: Ver Coleção)</label>
                <input type="text" value={newBanner.button_text} onChange={e => setNewBanner({ ...newBanner, button_text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Link (ex: /loja)</label>
                <input type="text" value={newBanner.link_url} onChange={e => setNewBanner({ ...newBanner, link_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none" />
              </div>
            </div>
            <button onClick={addBanner} disabled={!newBanner.image_url}
              className="bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-2 rounded-full font-bold uppercase text-sm disabled:opacity-50">
              Adicionar Banner
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map(banner => (
            <div key={banner.id} className="bg-neutral-900 rounded-2xl p-4 border border-white/10 flex gap-4 items-center">
              <img src={banner.image_url} alt="" className="w-32 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{banner.title || 'Sem título'}</h3>
                <p className="text-sm text-white/40 truncate">{banner.subtitle || ''}</p>
                <p className="text-xs text-white/30 mt-1">Botão: {banner.button_text || 'N/A'} → {banner.link_url || 'N/A'}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(banner)} className={`p-2 rounded-lg ${banner.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {banner.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => deleteBanner(banner.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
