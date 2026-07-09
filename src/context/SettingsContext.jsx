import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('light') // always start in light/day mode

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (data) {
      setSettings(data)
      // Apply border color CSS variable
      document.documentElement.style.setProperty('--border-color', data.border_color || '#ec4899')
      // Apply fonts
      applyFonts(data)
      // Update OG image
      if (data.profile_image_url) {
        const ogImg = document.getElementById('og-image')
        if (ogImg) ogImg.setAttribute('content', data.profile_image_url)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Theme management - always starts in light mode
  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light')
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const applyFonts = (s) => {
    const global = s.font_global
    const fontProducts = global || s.font_products || 'DM Sans'
    const fontCategories = global || s.font_categories || 'DM Sans'
    const fontBanners = global || s.font_banners || 'DM Sans'

    // Load fonts dynamically
    const fonts = new Set([fontProducts, fontCategories, fontBanners].filter(f => f && f !== 'DM Sans'))
    fonts.forEach(font => {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, '+')}:wght@400;500;700;900&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    })

    document.documentElement.style.setProperty('--font-products', `"${fontProducts}", sans-serif`)
    document.documentElement.style.setProperty('--font-categories', `"${fontCategories}", sans-serif`)
    document.documentElement.style.setProperty('--font-banners', `"${fontBanners}", sans-serif`)
  }

  const updateSettings = async (updates) => {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .maybeSingle()

    if (data) {
      setSettings(data)
      applyFonts(data)
      document.documentElement.style.setProperty('--border-color', data.border_color || '#ec4899')
      if (data.profile_image_url) {
        const ogImg = document.getElementById('og-image')
        if (ogImg) ogImg.setAttribute('content', data.profile_image_url)
      }
    }
    return { data, error }
  }

  const value = {
    settings,
    loading,
    theme,
    toggleTheme,
    fetchSettings,
    updateSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
