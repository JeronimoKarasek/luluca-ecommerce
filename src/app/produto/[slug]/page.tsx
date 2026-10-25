'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { Product, ProductVariant } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'
import { ShoppingBag, Minus, Plus, Truck, RefreshCw, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    if (slug) loadProduct()
  }, [slug])

  async function loadProduct() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('products_luluca')
        .select('*, category:categories_luluca(*), images:product_images_luluca(*), variants:product_variants_luluca(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (data) {
        setProduct(data)
        // Load related
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products_luluca')
            .select('*, category:categories_luluca(*), images:product_images_luluca(*)')
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(4)
          if (related) setRelatedProducts(related)
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('Selecione um tamanho/cor')
      return
    }
    addItem(product, selectedVariant, quantity)
    toast.success(`${product.name} adicionado à sacola!`)
    openCart()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-luluca-primary text-xl font-serif">Carregando...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p className="text-2xl font-serif">Produto não encontrado</p>
          <Link href="/produtos" className="btn-primary mt-6">Ver todos os produtos</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || []
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0
  const sizes = product.variants?.filter(v => v.size).map(v => v) || []
  const finalPrice = product.price + (selectedVariant?.price_modifier || 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-luluca-primary transition-colors">Início</Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-luluca-primary transition-colors">Produtos</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/produtos?categoria=${product.category.slug}`} className="hover:text-luluca-primary transition-colors">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url}
                    alt={images[selectedImage]?.alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={64} />
                  </div>
                )}
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-4 py-1.5 rounded-full font-medium">
                    -{discountPercent}%
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? 'border-luluca-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {product.category && (
                <p className="text-sm text-luluca-primary uppercase tracking-wider mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-luluca-dark">
                    {formatCurrency(finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.compare_at_price!)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ou 3x de <span className="font-medium">{formatCurrency(finalPrice / 3)}</span> sem juros
                </p>
                <p className="text-sm text-green-600 mt-1 font-medium">
                  {formatCurrency(finalPrice * 0.95)} no PIX (5% de desconto)
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Variants - Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <label className="label-field">Tamanho</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.is_active || variant.stock_quantity <= 0}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-luluca-primary bg-luluca-primary text-white'
                            : variant.stock_quantity <= 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-300 text-gray-600 hover:border-luluca-primary'
                        }`}
                      >
                        {variant.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="label-field">Quantidade</label>
                <div className="flex items-center border border-gray-300 rounded-md w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 mb-4">
                <ShoppingBag size={20} />
                Adicionar à Sacola
              </button>

              {/* Benefits */}
              <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={18} className="text-luluca-primary" />
                  Frete grátis para compras acima de R$ 299
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RefreshCw size={18} className="text-luluca-primary" />
                  Troca e devolução em até 30 dias
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={18} className="text-luluca-primary" />
                  Pagamento 100% seguro
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-gray-400 mt-6">SKU: {product.sku}</p>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-serif text-luluca-dark mb-3">Produtos Relacionados</h2>
              <div className="w-20 h-0.5 bg-luluca-gold mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
