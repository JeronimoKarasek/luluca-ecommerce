'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ShoppingBag, Menu, X, Search, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'
import CartDrawer from './CartDrawer'

type SubCategory = {
  id: string
  name: string
  slug: string
  category_id: string
  is_active: boolean
  sort_order: number
}

type CategoryWithSubs = Category & {
  subcategories: SubCategory[]
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [freeShippingAbove, setFreeShippingAbove] = useState('')
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [expandedDesktopCat, setExpandedDesktopCat] = useState<string | null>(null)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    // Load settings
    supabase
      .from('store_settings_luluca')
      .select('value')
      .eq('key', 'shipping_free_above')
      .single()
      .then(({ data }) => {
        if (data?.value) setFreeShippingAbove(data.value)
      })

    // Load categories with subcategories
    loadCategories()
  }, [])

  async function loadCategories() {
    const [catRes, subRes] = await Promise.all([
      supabase.from('categories_luluca').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('subcategories_luluca').select('*').eq('is_active', true).order('sort_order'),
    ])

    const cats = catRes.data || []
    const subs = subRes.data || []

    const catsWithSubs: CategoryWithSubs[] = cats.map((cat) => ({
      ...cat,
      subcategories: subs.filter((s) => s.category_id === cat.id),
    }))

    setCategories(catsWithSubs)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCatDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div className="bg-luluca-navy text-white text-center py-2 text-xs sm:text-sm tracking-wide">
        <p>✨ Peças novas e seminovas com curadoria · Enviamos para todo o Brasil 💛{freeShippingAbove ? ` · Frete GRÁTIS acima de R$ ${parseFloat(freeShippingAbove).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : ''}</p>
      </div>

      <header className="bg-luluca-cream/95 backdrop-blur-md sticky top-0 z-50 border-b border-luluca-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-luluca-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="LULUCA moda infantil"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="text-sm tracking-wider text-gray-600 hover:text-luluca-primary transition-colors duration-200 uppercase font-medium"
              >
                Início
              </Link>

              {/* Categorias Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className="text-sm tracking-wider text-gray-600 hover:text-luluca-primary transition-colors duration-200 uppercase font-medium flex items-center gap-1"
                >
                  Categorias
                  <ChevronDown size={14} className={`transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {catDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[280px] py-3 animate-fade-in z-50">
                    {/* Ver todos */}
                    <Link
                      href="/produtos"
                      className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-luluca-cream hover:text-luluca-primary transition-colors font-medium"
                      onClick={() => { setCatDropdownOpen(false); setExpandedDesktopCat(null) }}
                    >
                      Todos os Produtos
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />

                    {categories.map((cat) => (
                      <div key={cat.id}>
                        {cat.subcategories.length > 0 ? (
                          <button
                            onClick={() => setExpandedDesktopCat(expandedDesktopCat === cat.id ? null : cat.id)}
                            className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-gray-700 hover:bg-luluca-cream hover:text-luluca-primary transition-colors font-medium"
                          >
                            {cat.name}
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedDesktopCat === cat.id ? 'rotate-180' : ''}`} />
                          </button>
                        ) : (
                          <Link
                            href={`/produtos?categoria=${cat.slug}`}
                            className="flex items-center justify-between px-5 py-2.5 text-sm text-gray-700 hover:bg-luluca-cream hover:text-luluca-primary transition-colors font-medium"
                            onClick={() => { setCatDropdownOpen(false); setExpandedDesktopCat(null) }}
                          >
                            {cat.name}
                          </Link>
                        )}

                        {/* Subcategories - expand on click */}
                        {expandedDesktopCat === cat.id && cat.subcategories.length > 0 && (
                          <div className="pl-4 border-l-2 border-luluca-light ml-5 mb-1 animate-fade-in">
                            <Link
                              href={`/produtos?categoria=${cat.slug}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-500 hover:text-luluca-primary hover:bg-luluca-cream/50 transition-colors"
                              onClick={() => { setCatDropdownOpen(false); setExpandedDesktopCat(null) }}
                            >
                              Ver tudo em {cat.name}
                            </Link>
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/produtos?categoria=${cat.slug}&subcategoria=${sub.slug}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-500 hover:text-luluca-primary hover:bg-luluca-cream/50 transition-colors"
                                onClick={() => { setCatDropdownOpen(false); setExpandedDesktopCat(null) }}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-luluca-primary transition-colors"
              >
                <Search size={20} />
              </button>

              <button
                onClick={openCart}
                className="p-2 text-gray-600 hover:text-luluca-primary transition-colors relative"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-luluca-primary text-white text-xs rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-4 px-4 animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    window.location.href = `/produtos?busca=${encodeURIComponent(searchQuery)}`
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 pr-4"
                  autoFocus
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in">
            <nav className="flex flex-col py-4">
              <Link
                href="/"
                className="px-6 py-3 text-sm tracking-wider text-gray-600 hover:text-luluca-primary hover:bg-luluca-cream transition-colors uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>

              {/* Mobile Categorias */}
              <button
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className="px-6 py-3 text-sm tracking-wider text-gray-600 hover:text-luluca-primary hover:bg-luluca-cream transition-colors uppercase flex items-center justify-between"
              >
                Categorias
                <ChevronDown size={14} className={`transition-transform duration-200 ${mobileCatOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCatOpen && (
                <div className="bg-gray-50">
                  <Link
                    href="/produtos"
                    className="px-8 py-2.5 text-sm text-gray-600 hover:text-luluca-primary block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Todos os Produtos
                  </Link>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/produtos?categoria=${cat.slug}`}
                          className="flex-1 px-8 py-2.5 text-sm text-gray-600 hover:text-luluca-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                        {cat.subcategories.length > 0 && (
                          <button
                            onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)}
                            className="px-4 py-2.5 text-gray-400"
                          >
                            <ChevronDown size={14} className={`transition-transform ${mobileExpandedCat === cat.id ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      {mobileExpandedCat === cat.id && cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/produtos?categoria=${cat.slug}&subcategoria=${sub.slug}`}
                          className="pl-12 pr-8 py-2 text-sm text-gray-500 hover:text-luluca-primary block"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
