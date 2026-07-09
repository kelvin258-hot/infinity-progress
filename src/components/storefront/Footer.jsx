import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MessageCircle, Music, Share2, Globe, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../context/SettingsContext.jsx'

const iconMap = {
  instagram: Globe,
  'message-circle': MessageCircle,
  whatsapp: MessageCircle,
  music: Music,
  tiktok: Music,
  facebook: Globe,
  twitter: Share2,
  youtube: Globe,
  linkedin: Globe,
}

export default function Footer({ onCopyrightClick, showAdminBtn }) {
  const { theme, settings } = useSettings()
  const [socials, setSocials] = useState([])

  useEffect(() => {
    supabase.from('social_links').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setSocials(data || []))
  }, [])

  const isDark = theme === 'dark'

  return (
    <footer className={`mt-20 border-t ${isDark ? 'border-white/10 bg-black' : 'border-gray-200 bg-white'}`}>
      {/* How to buy section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h3 className={`text-2xl font-black uppercase mb-8 text-center ${isDark ? 'text-white' : 'text-black'}`}>
          Como Comprar
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* WhatsApp method */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
              <h4 className="text-lg font-bold uppercase">Comprar via WhatsApp</h4>
            </div>
            <ol className={`space-y-2 text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <li>1. Navegue pelos produtos e escolha a peça que deseja.</li>
              <li>2. Selecione o tamanho e a cor disponíveis.</li>
              <li>3. Clique no botão "Comprar via WhatsApp".</li>
              <li>4. Será aberto o WhatsApp com a sua encomenda pronta.</li>
              <li>5. Envie a mensagem e aguarde a confirmação.</li>
            </ol>
          </div>
          {/* Cart method */}
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white font-bold">2</div>
              <h4 className="text-lg font-bold uppercase">Comprar via Carrinho</h4>
            </div>
            <ol className={`space-y-2 text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <li>1. Adicione as peças ao carrinho clicando em "Adicionar ao Carrinho".</li>
              <li>2. Aceda ao carrinho e verifique os seus itens.</li>
              <li>3. Clique em "Finalizar Compra".</li>
              <li>4. Preencha os seus dados de envio e contacto.</li>
              <li>5. Escolha o método de pagamento (M-Pesa, E-Mola ou Cartão).</li>
              <li>6. Confirme a encomenda e aguarde o contacto da nossa equipa.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {socials.map(s => {
            const Icon = iconMap[s.icon] || ExternalLink
            return (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-brand-pink hover:text-white ${
                  isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                aria-label={s.platform}
              >
                <Icon size={18} />
              </a>
            )
          })}
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-xs uppercase tracking-wide">
          <span className={`hover:text-brand-pink cursor-pointer ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Política de Privacidade</span>
          <span className={`hover:text-brand-pink cursor-pointer ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Termos e Condições</span>
          <span className={`hover:text-brand-pink cursor-pointer ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Como Comprar</span>
          <span className={`hover:text-brand-pink cursor-pointer ${isDark ? 'text-white/60' : 'text-gray-500'}`}>FAQ</span>
          <span className={`hover:text-brand-pink cursor-pointer ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Contacto</span>
        </div>

        {/* Barcode */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-white p-3 rounded-lg">
            <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
              {Array.from({ length: 40 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * 3}
                  y={0}
                  width={i % 3 === 0 ? 2 : 1}
                  height={40}
                  fill="black"
                />
              ))}
            </svg>
          </div>
          <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            Escaneie para aceder ao site
          </p>
        </div>

        {/* Copyright with hidden admin trigger */}
        <div className="text-center">
          <p
            className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} cursor-default select-none`}
            onClick={onCopyrightClick}
          >
            © 2026 Infinity Progress. Todos os direitos reservados.
          </p>
          {showAdminBtn && (
            <Link
              to="/admin/login"
              className="inline-block mt-2 text-[10px] uppercase tracking-wide text-brand-pink hover:text-brand-pinkDark transition-colors"
            >
              Área de Administração
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}
