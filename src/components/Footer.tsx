'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type FooterSettings = {
  store_email: string
  store_phone: string
  store_address: string
  social_instagram: string
  social_facebook: string
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>({
    store_email: '',
    store_phone: '',
    store_address: '',
    social_instagram: '',
    social_facebook: '',
  })

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('store_settings_luluca')
        .select('key, value')
        .in('key', ['store_email', 'store_phone', 'store_address', 'social_instagram', 'social_facebook'])
      if (data) {
        const loaded: Record<string, string> = {}
        data.forEach((s: { key: string; value: string }) => {
          loaded[s.key] = s.value || ''
        })
        setSettings(prev => ({ ...prev, ...loaded }))
      }
    }
    loadSettings()
  }, [])

  const instagramUrl = settings.social_instagram
    ? settings.social_instagram.startsWith('http')
      ? settings.social_instagram
      : `https://instagram.com/${settings.social_instagram.replace('@', '')}`
    : ''

  const facebookUrl = settings.social_facebook
    ? settings.social_facebook.startsWith('http')
      ? settings.social_facebook
      : `https://facebook.com/${settings.social_facebook}`
    : ''

  return (
    <footer className="bg-luluca-navy text-white">
      {/* Newsletter */}
      <div className="bg-luluca-cream border-t border-luluca-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-serif text-luluca-navy mb-2">
              As novidades chegam primeiro aqui 💛
            </h3>
            <p className="text-luluca-navy/60 mb-6">
              Cadastre seu e-mail e seja a primeira a ver as pecinhas que acabaram de chegar
            </p>
            <form className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-2.5 rounded-lg border border-luluca-light bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luluca-primary/30 focus:border-luluca-primary"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LULUCA moda infantil" className="h-14 w-auto object-contain bg-luluca-cream/90 rounded-xl px-3 py-1.5 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Moda infantil com curadoria e carinho: peças novas e seminovas selecionadas uma a uma para o seu pequeno.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-luluca-light mb-4 uppercase tracking-wider text-sm">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/produtos" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=meninas" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Meninas
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=meninos" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Meninos
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=bebes" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Bebês
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=acessorios" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-luluca-light mb-4 uppercase tracking-wider text-sm">
              Ajuda
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-troca" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Política de Troca
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-luluca-light transition-colors text-sm">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-luluca-light mb-4 uppercase tracking-wider text-sm">
              Contato
            </h4>
            <ul className="space-y-3">
              {settings.store_email && (
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail size={16} className="text-luluca-gold flex-shrink-0" />
                  <a href={`mailto:${settings.store_email}`} className="hover:text-luluca-light transition-colors">
                    {settings.store_email}
                  </a>
                </li>
              )}
              {settings.store_phone && (
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <Phone size={16} className="text-luluca-gold flex-shrink-0" />
                  <a href={`tel:${settings.store_phone.replace(/\D/g, '')}`} className="hover:text-luluca-light transition-colors">
                    {settings.store_phone}
                  </a>
                </li>
              )}
              {settings.store_address && (
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <MapPin size={16} className="text-luluca-gold mt-0.5 flex-shrink-0" />
                  {settings.store_address}
                </li>
              )}
            </ul>
            {(instagramUrl || facebookUrl) && (
              <div className="flex items-center gap-4 mt-6">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luluca-primary transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luluca-primary transition-colors"
                  >
                    <Facebook size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} LULUCA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
