import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useSettings } from './context/SettingsContext.jsx'
import ProcessingLoader from './components/ProcessingLoader.jsx'

// Storefront
const StorefrontLayout = lazy(() => import('./components/storefront/StorefrontLayout.jsx'))
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'))
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const SavedPage = lazy(() => import('./pages/SavedPage.jsx'))

// Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'))
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit.jsx'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners.jsx'))
const AdminSocial = lazy(() => import('./pages/admin/AdminSocial.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'))
const AdminFonts = lazy(() => import('./pages/admin/AdminFonts.jsx'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile.jsx'))

function PageLoader() {
  const { settings } = useSettings()
  return <ProcessingLoader settings={settings} />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/loja" element={<ShopPage />} />
            <Route path="/loja/:category" element={<ShopPage />} />
            <Route path="/produto/:id" element={<ProductPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/guardados" element={<SavedPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="produtos/:id" element={<AdminProductEdit />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="redes-sociais" element={<AdminSocial />} />
            <Route path="encomendas" element={<AdminOrders />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="fontes" element={<AdminFonts />} />
            <Route path="perfil" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
