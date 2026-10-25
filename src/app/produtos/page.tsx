'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { Product, Category, SubCategory } from '@/lib/types'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoria') || '')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategoria') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('busca') || '')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    setSelectedCategory(searchParams.get('categoria') || '')
    setSelectedSubcategory(searchParams.get('subcategoria') || '')
    setSearchQuery(searchParams.get('busca') || '')
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, selectedSubcategory, sortBy, searchQuery])

  async function loadCategories() {
    const [catRes, subRes] = await Promise.all([
      supabase
        .from('categories_luluca')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('subcategories_luluca')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ])
    if (catRes.data) setCategories(catRes.data)
    if (subRes.data) setSubcategories(subRes.data)
  }

  // Get subcategories for the selected category
  const currentCategoryId = categories.find(c => c.slug === selectedCategory)?.id
  const filteredSubcategories = currentCategoryId
    ? subcategories.filter(s => s.category_id === currentCategoryId)
    : []

  async function loadProducts() {
    setLoading(true)
    try {
      let query = supabase
        .from('products_luluca')
        .select('*, category:categories_luluca(*), subcategory:subcategories_luluca(*), images:product_images_luluca(*)')
        .eq('is_active', true)

      if (selectedCategory) {
        const cat = categories.find(c => c.slug === selectedCategory)
        if (cat) {
          query = query.eq('category_id', cat.id)
        } else {
          const { data: catData } = await supabase
            .from('categories_luluca')
            .select('id')
            .eq('slug', selectedCategory)
            .single()
          if (catData) {
            query = query.eq('category_id', catData.id)
          }
        }
      }

      if (selectedSubcategory) {
        const sub = subcategories.find(s => s.slug === selectedSubcategory)
        if (sub) {
          query = query.eq('subcategory_id', sub.id)
        } else {
          const { data: subData } = await supabase
            .from('subcategories_luluca')
            .select('id')
            .eq('slug', selectedSubcategory)
            .single()
          if (subData) {
            query = query.eq('subcategory_id', subData.id)
          }
        }
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data } = await query
      if (data) setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-luluca-cream to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-serif text-luluca-dark">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : selectedSubcategory
                ? subcategories.find(s => s.slug === selectedSubcategory)?.name || 'Produtos'
                : selectedCategory
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Produtos'
                : 'Todos os Produtos'}
            </h1>
            <div className="w-20 h-0.5 bg-luluca-gold mt-3" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setSearchQuery('') }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-luluca-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setSelectedSubcategory('') }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-luluca-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{products.length} produtos</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field !w-auto !py-2 text-sm"
              >
                <option value="newest">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          {/* Subcategories filter */}
          {filteredSubcategories.length > 0 && selectedCategory && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="text-sm text-gray-500 mr-1">Subcategorias:</span>
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedSubcategory ? 'bg-luluca-gold text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Todas
              </button>
              {filteredSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSubcategory === sub.slug
                      ? 'bg-luluca-gold text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                  <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl font-serif">Nenhum produto encontrado</p>
              <p className="text-sm mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
              <button
                onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setSearchQuery('') }}
                className="btn-secondary mt-6"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-luluca-primary text-xl font-serif">Carregando...</div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
