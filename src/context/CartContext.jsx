import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ip_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('ip_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, size, color, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === product.id && item.size === size && item.color === color
      )
      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.primaryImage,
        size,
        color,
        quantity,
      }]
    })
  }

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
