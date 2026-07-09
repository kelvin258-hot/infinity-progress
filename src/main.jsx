import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { SavedProvider } from './context/SavedContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <SavedProvider>
            <App />
          </SavedProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
