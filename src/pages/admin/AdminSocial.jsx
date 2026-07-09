import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const platformOptions = [
  { platform: 'Instagram', icon: 'instagram' },
  { platform: 'WhatsApp', icon: 'message-circle' },
  { platform: 'TikTok', icon: 'music' },
  { platform: 'Facebook', icon: 'facebook' },
  { platform: 'Twitter / X', icon: 'twitter' },
  { platform: 'YouTube', icon: 'youtube' },
  { platform: 'LinkedIn', icon: 'linkedin' },
]

export default function AdminSocial() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newLink, setNewLink] = useState({ platform: 'Instagram', url: '', icon: 'instagram' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('social_links').select('*').order('sort_order')
    setLinks(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addLink = async () => {
    if (!newLink.url) return
    await supabase.from('social_links').insert({
      platform: newLink.platform,
      url: newLink.url,
      icon: newLink.icon,
    })
    setNewLink({ platform: 'Instagram', url: '', icon: 'instagram' })
    setShowForm(false)
    load()
  }

  const toggleActive = async (link) => {
    await supabase.from('social_links').update({ is_active: !link.is_active }).eq('id', link.id)
    load()
  }

  const deleteLink = async (id) => {
    await supabase.from('social_links').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Redes Sociais</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-3 rounded-full font-bold uppercase text-sm transition-colors"
        >
          <Plus size={18} /> Adicionar Rede
        </button>
      </div>

      {showForm && (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Plataforma</label>
              <select
                value={newLink.platform}
                onChange={e => {
                  const opt = platformOptions.find(o => o.platform === e.target.value)
                  setNewLink({ ...newLink, platform: e.target.value, icon: opt?.icon || 'link' })
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              >
                {platformOptions.map(o => <option key={o.platform} value={o.platform}>{o.platform}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">URL</label>
              <input
                type="url"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
              />
            </div>
            <button onClick={addLink} disabled={!newLink.url}
              className="bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-2 rounded-full font-bold uppercase text-sm disabled:opacity-50">
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
          {links.map(link => (
            <div key={link.id} className="bg-neutral-900 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{link.platform}</h3>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-brand-pink hover:underline truncate block max-w-xs">
                  {link.url}
                </a>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(link)} className={`p-2 rounded-lg ${link.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {link.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => deleteLink(link.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20">
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
