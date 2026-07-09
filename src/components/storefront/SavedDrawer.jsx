import { X, Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSaved } from '../../context/SavedContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { formatPrice } from '../../lib/utils'

export default function SavedDrawer({ open, onClose }) {
  const { savedItems, toggleSave, loading } = useSaved()
  const { theme } = useSettings()
  const isDark = theme === 'dark'

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold uppercase flex items-center gap-2">
            <Heart size={20} className="text-brand-pink" />
            Guardados
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
          {loading ? (
            <p className="text-center text-sm opacity-50">A carregar...</p>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm opacity-50">Nenhum produto guardado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                  isDark ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <Link to={`/produto/${item.product_id}`} onClick={onClose} className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product?.name || 'Produto'}</p>
                    <p className="text-brand-pink text-sm font-bold">
                      {formatPrice(item.product?.price || 0)}
                    </p>
                  </Link>
                  <button
                    onClick={() => toggleSave(item.product_id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                    aria-label="Remover dos guardados"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
