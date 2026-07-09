import { useSettings } from '../context/SettingsContext.jsx'

export default function ProcessingLoader({ settings: overrideSettings }) {
  const { settings: ctxSettings } = useSettings()
  const settings = overrideSettings || ctxSettings
  const profileImage = settings?.profile_image_url

  return (
    <div className="processing-overlay">
      <div className="flex flex-col items-center gap-6">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Infinity Progress"
            className={`w-24 h-24 object-contain ${settings?.profile_rotate ? 'animate-spin-slow' : ''}`}
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-brand-pink border-t-transparent animate-spin" />
        )}
        <p className="text-white text-lg font-bold uppercase tracking-widest animate-pulse">
          Processando
        </p>
      </div>
    </div>
  )
}
