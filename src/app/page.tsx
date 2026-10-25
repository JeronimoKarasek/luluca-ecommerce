'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/lib/types'
import {
  ArrowRight, Truck, Shield, RefreshCw, CreditCard, Heart, Sparkles,
  Instagram, Baby, Shirt, Gift, Leaf,
} from 'lucide-react'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [freeShippingAbove, setFreeShippingAbove] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [featuredRes, newRes, catRes] = await Promise.all([
        supabase
          .from('products_luluca')
          .select('*, category:categories_luluca(*), images:product_images_luluca(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(8),
        supabase
          .from('products_luluca')
          .select('*, category:categories_luluca(*), images:product_images_luluca(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('categories_luluca')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ])

      if (featuredRes.data) setFeaturedProducts(featuredRes.data)
      if (newRes.data) setNewProducts(newRes.data)
      if (catRes.data) setCategories(catRes.data)

      // Carregar valor de frete grátis
      const { data: shippingSetting } = await supabase
        .from('store_settings_luluca')
        .select('value')
        .eq('key', 'shipping_free_above')
        .single()
      if (shippingSetting?.value) setFreeShippingAbove(shippingSetting.value)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    meninas: <Shirt size={26} />,
    meninos: <Shirt size={26} />,
    bebes: <Baby size={26} />,
    sapatinhos: <Heart size={26} />,
    acessorios: <Gift size={26} />,
  }

  return (
    <div className="min-h-screen flex flex-col bg-luluca-cream">
      <Header />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden hero-blob">
          {/* fundos decorativos */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-luluca-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-luluca-rose/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-14 md:pb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-white/80 border border-luluca-gold/40 rounded-full px-4 py-1.5 mb-4 shadow-sm">
                  <Sparkles size={15} className="text-luluca-gold" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-luluca-navy">
                    Novas & seminovas · curadoria de coração
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.05] text-luluca-navy mb-4">
                  Peças que a mamãe aprova{' '}
                  <span className="gold-text">e a criançada ama</span>{' '}
                  <Heart className="inline-block text-luluca-gold animate-float-heart" size={34} fill="currentColor" />
                </h1>

                <p className="text-lg md:text-xl text-luluca-navy/70 mb-3 max-w-xl">
                  Moda infantil nova e seminova, selecionada peça por peça com carinho —
                  qualidade de loja, preço de desapego.
                </p>
                <p className="text-luluca-navy/60 mb-6 max-w-xl">
                  Cada pecinha é única. Quando ama, é só chegar no carrinho antes de outra mamãe 💛
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-5">
                  <Link href="/produtos" className="btn-primary inline-flex items-center gap-2 text-base animate-pulse">
                    Comprar agora — peças de hoje
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="https://www.instagram.com/lulucadesapegos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-luluca-navy font-semibold hover:text-luluca-gold transition-colors"
                  >
                    <Instagram size={18} />
                    @lulucadesapegos
                  </a>
                </div>
                <p className="text-sm font-semibold text-luluca-gold-deep mb-8">
                  ⚡ Estoque pequeno e rotativo: as fofas voam no mesmo dia
                </p>

                {/* prova social */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-luluca-navy/70">
                  <span className="flex items-center gap-1.5">
                    <span className="flex text-luluca-gold">★★★★★</span>
                    Amado pelas mamães
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck size={16} className="text-luluca-gold" />
                    Envio para todo o Brasil
                  </span>
                </div>
              </div>

              {/* Card do logo */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 translate-y-6 translate-x-6 bg-luluca-gold/20 rounded-[2.5rem] rotate-2" />
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-luluca-gold/20 border border-luluca-gold/30 p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="LULUCA moda infantil"
                    className="w-full h-auto object-contain"
                  />
                  <div className="text-center mt-6">
                    <p className="font-serif text-2xl text-luluca-navy">moda infantil</p>
                    <p className="text-sm text-luluca-navy/60 mt-1 tracking-widest">com amor, do cabide pro coração</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE de urgência ============ */}
        <section className="bg-luluca-navy text-white py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[0, 1].map((n) => (
              <span key={n} className="flex items-center gap-8 pr-8 text-sm tracking-wide">
                <span>✨ Peças únicas — quando vende, não volta</span>
                <span>💛 Nova e seminova com curadoria</span>
                <span>📦 Enviamos para todo o Brasil</span>
                <span>💗 Troca fácil em até 7 dias</span>
                <span>✨ Peças únicas — quando vende, não volta</span>
                <span>💛 Nova e seminova com curadoria</span>
                <span>📦 Enviamos para todo o Brasil</span>
                <span>💗 Troca fácil em até 7 dias</span>
              </span>
            ))}
          </div>
        </section>

        {/* ============ BENEFÍCIOS ============ */}
        <section className="bg-white border-b border-luluca-gold/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {freeShippingAbove && (
                <div className="flex items-center gap-3 justify-center">
                  <Truck size={24} className="text-luluca-gold flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-luluca-navy">Frete Grátis</p>
                    <p className="text-xs text-luluca-navy/60">Acima de R$ {parseFloat(freeShippingAbove).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 justify-center">
                <CreditCard size={24} className="text-luluca-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-luluca-navy">PIX com desconto</p>
                  <p className="text-xs text-luluca-navy/60">Na hora do checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <RefreshCw size={24} className="text-luluca-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-luluca-navy">Troca Fácil</p>
                  <p className="text-xs text-luluca-navy/60">Em até 7 dias</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Shield size={24} className="text-luluca-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-luluca-navy">Compra Segura</p>
                  <p className="text-xs text-luluca-navy/60">Dados protegidos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SOBRE / CURADORIA ============ */}
        <section className="py-16 md:py-20 bg-luluca-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Sparkles className="text-luluca-gold" size={28} />,
                  title: 'Curadoria de verdade',
                  text: 'Cada peça é escolhida, lavada e conferida uma a uma. Só entra na loja o que a gente vestiria nos nossos filhos.',
                },
                {
                  icon: <Leaf className="text-luluca-gold" size={28} />,
                  title: 'Consumo consciente',
                  text: 'Seminovas em perfeito estado ganham uma nova história. Menos desperdício, mais amor no guarda-roupa.',
                },
                {
                  icon: <Heart className="text-luluca-gold" size={28} />,
                  title: 'Peça única, aposta certa',
                  text: 'A maior parte do estoque tem só uma unidade. Viu, amou, levou — antes que outra mamãe chegue primeiro.',
                },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-7 border border-luluca-gold/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-luluca-cream flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-serif text-xl text-luluca-navy mb-2">{f.title}</h3>
                  <p className="text-sm text-luluca-navy/70 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CATEGORIAS ============ */}
        {categories.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="section-eyebrow mb-3">Escolha por</p>
                <h2 className="text-3xl md:text-4xl font-serif text-luluca-navy mb-3">
                  Categorias
                </h2>
                <div className="heart-divider text-luluca-gold">
                  <Heart size={18} fill="currentColor" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/produtos?categoria=${cat.slug}`}
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-luluca-gold/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-luluca-navy/80 via-luluca-navy/30 to-transparent z-10" />
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-luluca-cream via-white to-luluca-gold/20 flex items-center justify-center text-luluca-gold/40">
                        {categoryIcons[cat.slug] || <Shirt size={40} />}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <h3 className="text-lg font-serif text-white mb-0.5">{cat.name}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1 group-hover:text-luluca-gold transition-colors">
                        Ver peças <ArrowRight size={13} />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ DESTAQUES ============ */}
        <section className="py-16 bg-luluca-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-eyebrow mb-2">Favoritas da semana</p>
                <h2 className="text-3xl md:text-4xl font-serif text-luluca-navy mb-3">
                  Destaques
                </h2>
                <div className="w-20 h-0.5 bg-luluca-gold" />
              </div>
              <Link
                href="/produtos"
                className="text-luluca-navy hover:text-luluca-gold transition-colors text-sm font-bold flex items-center gap-1"
              >
                Ver todas <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-luluca-gold/10 rounded-xl" />
                    <div className="mt-4 h-4 bg-luluca-gold/10 rounded w-3/4" />
                    <div className="mt-2 h-4 bg-luluca-gold/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Vestidinho', 'Conjuntinho', 'Macacãozinho', 'Sapatinho'].map((n) => (
                  <div key={n} className="rounded-2xl overflow-hidden border border-luluca-gold/25 bg-white shadow-sm">
                    <div className="aspect-[3/4] bg-gradient-to-br from-luluca-cream via-white to-luluca-gold/15 flex flex-col items-center justify-center gap-2 text-luluca-gold">
                      <Heart size={34} fill="currentColor" className="opacity-70" />
                      <span className="font-serif text-luluca-navy/70">{n}</span>
                      <span className="text-[11px] uppercase tracking-widest text-luluca-navy/40">Em breve</span>
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-serif text-luluca-navy">Curadoria da semana</p>
                      <Link href="/produtos" className="text-xs font-bold text-luluca-gold-deep hover:underline inline-flex items-center gap-1 mt-1">
                        Ver a vitrine completa <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============ CTA GRANDE ============ */}
        <section className="relative overflow-hidden bg-luluca-navy py-20">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-luluca-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-luluca-rose/10 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <p className="text-luluca-gold uppercase tracking-[0.35em] text-xs font-bold mb-4">
              Vem fazer parte
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-5 leading-tight">
              O guarda-roupa que cresce com seu pequeno
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-9">
              Novidades toda semana, peças exclusivas e preços de desapego que cabem no bolso.
            </p>
            <Link href="/produtos" className="btn-gold inline-flex items-center gap-2 text-base">
              Ver todas as peças
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ============ NOVIDADES ============ */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-eyebrow mb-2">Acabaram de chegar</p>
                <h2 className="text-3xl md:text-4xl font-serif text-luluca-navy mb-3">
                  Novidades
                </h2>
                <div className="w-20 h-0.5 bg-luluca-gold" />
              </div>
              <Link
                href="/produtos"
                className="text-luluca-navy hover:text-luluca-gold transition-colors text-sm font-bold flex items-center gap-1"
              >
                Ver todas <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-luluca-gold/10 rounded-xl" />
                    <div className="mt-4 h-4 bg-luluca-gold/10 rounded w-3/4" />
                    <div className="mt-2 h-4 bg-luluca-gold/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : newProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Body baby', 'Look menininha', 'Look menininho', 'Acessório fofo'].map((n) => (
                  <div key={n} className="rounded-2xl overflow-hidden border border-luluca-gold/25 bg-white shadow-sm">
                    <div className="aspect-[3/4] bg-gradient-to-br from-white via-luluca-cream to-luluca-rose/10 flex flex-col items-center justify-center gap-2 text-luluca-gold">
                      <Sparkles size={34} className="opacity-70" />
                      <span className="font-serif text-luluca-navy/70">{n}</span>
                      <span className="text-[11px] uppercase tracking-widest text-luluca-navy/40">Chegando</span>
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-serif text-luluca-navy">Novidade rolando</p>
                      <Link href="/produtos" className="text-xs font-bold text-luluca-gold-deep hover:underline inline-flex items-center gap-1 mt-1">
                        Ver novidades <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
