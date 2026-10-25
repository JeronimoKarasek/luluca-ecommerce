'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, variant?: ProductVariant, quantity: number = 1) => {
        const items = get().items
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id && item.variant?.id === variant?.id
        )

        if (existingIndex > -1) {
          const newItems = [...items]
          newItems[existingIndex].quantity += quantity
          set({ items: newItems })
        } else {
          const primaryImage = product.images?.find((img) => img.is_primary)
          const firstImage = product.images?.[0]
          set({
            items: [
              ...items,
              {
                product,
                variant,
                quantity,
                image: primaryImage?.url || firstImage?.url,
              },
            ],
          })
        }
      },

      removeItem: (productId: string, variantId?: string) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.variant?.id === variantId)
          ),
        })
      },

      updateQuantity: (productId: string, quantity: number, variantId?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        const items = get().items.map((item) => {
          if (item.product.id === productId && item.variant?.id === variantId) {
            return { ...item, quantity }
          }
          return item
        })
        set({ items })
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price + (item.variant?.price_modifier || 0)
          return total + price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'luluca-cart',
    }
  )
)
