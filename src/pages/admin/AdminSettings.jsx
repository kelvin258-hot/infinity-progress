import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { Lock, Palette, Type, Clock, Key } from 'lucide-react'

export default function AdminSettings() {
  const { updatePassword } = useAuth()
  const { settings, updateSettings } = useSettings()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const [borderColor, setBorderColor] = useState(settings?.border_color || '#ec4899')
  const [lockSeconds, setLockSeconds] = useState(settings?.admin_lock_seconds || 1)
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsapp_number || '258873263515')
  const [promoText, setPromoText] = useState(settings?.promo_text || '')
  const [promoActive, setPromoActive] = useState(settings?.promo_active || false)
  const [saveMsg, setSaveMsg] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg('As palavras-passe não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('A palavra-passe deve ter pelo menos 6 caracteres.')
      return
    }
    const { error } = await updatePassword(newPassword)
    if (error) {
      setPasswordMsg('Erro ao alterar palavra-passe: ' + error.message)
    } else {
      setPasswordMsg('Palavra-passe alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSaveSettings = async () => {
    await updateSettings({
      border_color: borderColor,
      admin_lock_seconds: parseInt(lockSeconds),
      whatsapp_number: whatsappNumber,
      promo_text: promoText,
      promo_active: promoActive,
    })
    setSaveMsg('Configurações guardadas!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-black uppercase mb-8">Configurações</h1>

      {/* Password change */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Key size={20} /> Alterar Palavra-passe
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Nova Palavra-passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Confirmar Palavra-passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
            />
          </div>
          {passwordMsg && <p className={`text-sm ${passwordMsg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg}</p>}
          <button type="submit" className="bg-brand-pink hover:bg-brand-pinkDark text-white px-6 py-2 rounded-full font-bold uppercase text-sm">
            Alterar
          </button>
        </form>
      </div>

      {/* Admin lock timer */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} /> Bloqueio Automático da Área de Admin
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Define o tempo para bloquear automaticamente a área de administração quando sai ou muda de separador.
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 3, 5, 10, 30].map(sec => (
            <button
              key={sec}
              onClick={() => setLockSeconds(sec)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                lockSeconds === sec ? 'bg-brand-pink text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Border color */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Palette size={20} /> Cor da Borda das Letras
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Esta cor é usada na borda fina das letras sobrepostas às imagens (categorias, banners) para garantir visibilidade.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={borderColor}
            onChange={e => setBorderColor(e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0"
          />
          <input
            type="text"
            value={borderColor}
            onChange={e => setBorderColor(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Promo text */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Type size={20} /> Texto Promocional
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Texto exibido no topo do site. Deixe vazio e desative para remover completamente.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={promoText}
            onChange={e => setPromoText(e.target.value)}
            placeholder="ex: PARCELAMENTO ATÉ 10X SEM JUROS"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={promoActive}
              onChange={e => setPromoActive(e.target.checked)}
              className="w-5 h-5 accent-brand-pink"
            />
            <label className="text-sm">Ativar texto promocional</label>
          </div>
        </div>
      </div>

      {/* WhatsApp number */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-bold mb-4">Número de WhatsApp</h2>
        <input
          type="text"
          value={whatsappNumber}
          onChange={e => setWhatsappNumber(e.target.value)}
          placeholder="258873263515"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
        />
        <p className="text-xs text-white/40 mt-1">Formato: código do país + número, sem + ou espaços.</p>
      </div>

      {/* Save */}
      <button
        onClick={handleSaveSettings}
        className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors"
      >
        Guardar Configurações
      </button>
      {saveMsg && <p className="text-green-400 text-sm text-center mt-4">{saveMsg}</p>}
    </div>
  )
}
