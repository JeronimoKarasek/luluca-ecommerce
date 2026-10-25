'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const primaryImage = product.images?.find((img) => img.is_primary)
  const firstImage = product.images?.[0]
  const imageUrl = primaryImage?.url || firstImage?.url

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} adicionado à sacola!`)
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  return (
    <Link href={`/produto/${product.slug}`} className="group">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag size={48} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="bg-luluca-gold text-white text-xs px-3 py-1 rounded-full font-medium">
                Destaque
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-white text-luluca-dark py-2.5 rounded-md text-sm font-medium
                         hover:bg-luluca-primary hover:text-white transition-colors duration-200
                         flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Adicionar à Sacola
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-luluca-primary uppercase tracking-wider mb-1">
            {product.category?.name || 'Geral'}
          </p>
          <h3 className="text-sm font-medium text-gray-800 group-hover:text-luluca-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-luluca-dark">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.compare_at_price!)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ou 3x de {formatCurrency(product.price / 3)} sem juros
          </p>
        </div>
      </div>
    </Link>
  )
}
