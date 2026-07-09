import { useState, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext.jsx'
import { Upload, RotateCw, Check } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../../lib/supabase'

export default function AdminProfile() {
  const { settings, updateSettings } = useSettings()
  const [imageUrl, setImageUrl] = useState(settings?.profile_image_url || '')
  const [rotate, setRotate] = useState(settings?.profile_rotate || false)
  const [uploading, setUploading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    await updateSettings({
      profile_image_url: imageUrl,
      profile_rotate: rotate,
    })
    // Update OG image meta tag
    if (imageUrl) {
      const ogImg = document.getElementById('og-image')
      if (ogImg) ogImg.setAttribute('content', imageUrl)
    }
    setSaveMsg('Perfil guardado com sucesso!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-black uppercase mb-8">Perfil do Site</h1>

      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4">Imagem de Perfil / Logótipo</h2>
        <p className="text-sm text-white/50 mb-4">
          Esta imagem aparece no cabeçalho do site, no ecrã de processamento e nos links partilhados (pré-visualização).
        </p>

        {/* Preview */}
        <div className="flex items-center gap-6 mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Perfil"
              className={`w-32 h-32 object-contain ${rotate ? 'animate-spin-slow' : ''}`}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/30 text-sm">Sem imagem</span>
            </div>
          )}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files[0] && handleUpload(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              {uploading ? 'A carregar...' : 'Carregar da Galeria'}
            </button>
            {imageUrl && (
              <button
                onClick={() => setImageUrl('')}
                className="ml-2 text-red-400 text-sm hover:text-red-300"
              >
                Remover
              </button>
            )}
          </div>
        </div>

        {/* Rotation toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
          <input
            type="checkbox"
            checked={rotate}
            onChange={e => setRotate(e.target.checked)}
            className="w-5 h-5 accent-brand-pink"
          />
          <RotateCw size={18} className={rotate ? 'text-brand-pink animate-spin-slow' : 'text-white/40'} />
          <label className="text-sm">Ativar movimento circular uniforme (rotação lenta)</label>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors"
      >
        Guardar Perfil
      </button>
      {saveMsg && (
        <p className="text-green-400 text-sm text-center mt-4 flex items-center justify-center gap-2">
          <Check size={16} /> {saveMsg}
        </p>
      )}
    </div>
  )
}
