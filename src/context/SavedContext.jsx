import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/utils'

const SavedContext = createContext({})

export function SavedProvider({ children }) {
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(true)

  const sessionId = getSessionId()

  const fetchSaved = useCallback(async () => {
    const { data } = await supabase
      .from('saved_items')
      .select('id, product_id, product:products(id, name, price)')
      .eq('session_id', sessionId)
    setSavedItems(data || [])
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  const isSaved = (productId) => {
    return savedItems.some(item => item.product_id === productId)
  }

  const toggleSave = async (productId) => {
    if (isSaved(productId)) {
      const item = savedItems.find(i => i.product_id === productId)
      await supabase.from('saved_items').delete().eq('id', item.id)
      setSavedItems(prev => prev.filter(i => i.product_id !== productId))
    } else {
      const { data } = await supabase
        .from('saved_items')
        .insert({ session_id: sessionId, product_id: productId })
        .select('id, product_id')
        .maybeSingle()
      if (data) {
        // Fetch product info for display
        const { data: product } = await supabase
          .from('products')
          .select('id, name, price')
          .eq('id', productId)
          .maybeSingle()
        setSavedItems(prev => [...prev, { ...data, product }])
      }
    }
  }

  const value = { savedItems, isSaved, toggleSave, loading, fetchSaved }

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  return useContext(SavedContext)
}
