'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Settings, CreditCard, Truck, Store, Save, Eye, EyeOff, DollarSign } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('store')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const [settings, setSettings] = useState({
    // Loja
    store_name: 'LULUCA',
    store_description: '',
    store_email: '',
    store_phone: '',
    store_whatsapp: '',
    store_address: '',
    store_cnpj: '',
    // Redes sociais
    social_instagram: '',
    social_facebook: '',
    social_tiktok: '',
    // Pagamento - Mercado Pago
    mp_enabled: false,
    mp_public_key: '',
    mp_access_token: '',
    mp_sandbox: true,
    // Pagamento - Asaas
    asaas_enabled: false,
    asaas_api_key: '',
    asaas_sandbox: true,
    // PIX manual
    pix_enabled: true,
    pix_key: '',
    pix_key_type: 'cpf',
    pix_holder_name: '',
    // Frete
    shipping_free_above: '',
    shipping_default_price: '',
    shipping_estimated_days: '7',
    // Geral
    maintenance_mode: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from('store_settings_luluca').select('*')
    if (data && data.length > 0) {
      const loaded: Record<string, string | boolean> = {}
      data.forEach((s: { key: string; value: string }) => {
        if (s.value === 'true') loaded[s.key] = true
        else if (s.value === 'false') loaded[s.key] = false
        else loaded[s.key] = s.value
      })
      setSettings(prev => ({ ...prev, ...loaded }))
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }))

      // Upsert each entry
      for (const entry of entries) {
        await supabase
          .from('store_settings_luluca')
          .upsert(entry, { onConflict: 'key' })
      }

      toast.success('Configurações salvas!')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
    setSaving(false)
  }

  function toggleKeyVisibility(key: string) {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    { id: 'store', label: 'Loja', icon: Store },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'shipping', label: 'Frete', icon: Truck },
    { id: 'advanced', label: 'Avançado', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-luluca-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie as configurações da loja</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Tudo'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white text-luluca-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="font-medium text-gray-800 border-b pb-3">Informações da Loja</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Nome da Loja</label>
              <input value={settings.store_name} onChange={(e) => setSettings({...settings, store_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="label-field">CNPJ</label>
              <input value={settings.store_cnpj} onChange={(e) => setSettings({...settings, store_cnpj: e.target.value})} className="input-field" placeholder="00.000.000/0000-00" />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">Descrição</label>
              <textarea value={settings.store_description} onChange={(e) => setSettings({...settings, store_description: e.target.value})} className="input-field" rows={2} />
            </div>
            <div>
              <label className="label-field">E-mail</label>
              <input type="email" value={settings.store_email} onChange={(e) => setSettings({...settings, store_email: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="label-field">Telefone</label>
              <input value={settings.store_phone} onChange={(e) => setSettings({...settings, store_phone: e.target.value})} className="input-field" placeholder="(00) 0000-0000" />
            </div>
            <div>
              <label className="label-field">WhatsApp</label>
              <input value={settings.store_whatsapp} onChange={(e) => setSettings({...settings, store_whatsapp: e.target.value})} className="input-field" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="label-field">Endereço</label>
              <input value={settings.store_address} onChange={(e) => setSettings({...settings, store_address: e.target.value})} className="input-field" />
            </div>
          </div>

          <h3 className="font-medium text-gray-800 border-b pb-3 pt-4">Redes Sociais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Instagram</label>
              <input value={settings.social_instagram} onChange={(e) => setSettings({...settings, social_instagram: e.target.value})} className="input-field" placeholder="@luluca" />
            </div>
            <div>
              <label className="label-field">Facebook</label>
              <input value={settings.social_facebook} onChange={(e) => setSettings({...settings, social_facebook: e.target.value})} className="input-field" placeholder="facebook.com/luluca" />
            </div>
            <div>
              <label className="label-field">TikTok</label>
              <input value={settings.social_tiktok} onChange={(e) => setSettings({...settings, social_tiktok: e.target.value})} className="input-field" placeholder="@luluca" />
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Mercado Pago */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Mercado Pago</h3>
                  <p className="text-xs text-gray-500">Cartão, PIX e Boleto via Mercado Pago</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.mp_enabled} onChange={(e) => setSettings({...settings, mp_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {settings.mp_enabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.mp_sandbox} onChange={(e) => setSettings({...settings, mp_sandbox: e.target.checked})} className="rounded" />
                    <span className="text-sm text-gray-600">Modo Sandbox (testes)</span>
                  </label>
                </div>
                <div>
                  <label className="label-field">Public Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.mp_public_key ? 'text' : 'password'}
                      value={settings.mp_public_key}
                      onChange={(e) => setSettings({...settings, mp_public_key: e.target.value})}
                      className="input-field pr-10"
                      placeholder="APP_USR-..."
                    />
                    <button onClick={() => toggleKeyVisibility('mp_public_key')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys.mp_public_key ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Access Token</label>
                  <div className="relative">
                    <input
                      type={showKeys.mp_access_token ? 'text' : 'password'}
                      value={settings.mp_access_token}
                      onChange={(e) => setSettings({...settings, mp_access_token: e.target.value})}
                      className="input-field pr-10"
                      placeholder="APP_USR-..."
                    />
                    <button onClick={() => toggleKeyVisibility('mp_access_token')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys.mp_access_token ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asaas */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Asaas</h3>
                  <p className="text-xs text-gray-500">Cobranças, PIX e Boleto via Asaas</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.asaas_enabled} onChange={(e) => setSettings({...settings, asaas_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {settings.asaas_enabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.asaas_sandbox} onChange={(e) => setSettings({...settings, asaas_sandbox: e.target.checked})} className="rounded" />
                    <span className="text-sm text-gray-600">Modo Sandbox (testes)</span>
                  </label>
                </div>
                <div>
                  <label className="label-field">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.asaas_api_key ? 'text' : 'password'}
                      value={settings.asaas_api_key}
                      onChange={(e) => setSettings({...settings, asaas_api_key: e.target.value})}
                      className="input-field pr-10"
                      placeholder="$aact_..."
                    />
                    <button onClick={() => toggleKeyVisibility('asaas_api_key')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys.asaas_api_key ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PIX Manual */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">PIX Manual</h3>
                  <p className="text-xs text-gray-500">Chave PIX exibida ao cliente para pagamento</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.pix_enabled} onChange={(e) => setSettings({...settings, pix_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {settings.pix_enabled && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="label-field">Tipo da Chave</label>
                  <select value={settings.pix_key_type} onChange={(e) => setSettings({...settings, pix_key_type: e.target.value})} className="input-field">
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Chave PIX</label>
                  <input value={settings.pix_key} onChange={(e) => setSettings({...settings, pix_key: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Nome do Titular</label>
                  <input value={settings.pix_holder_name} onChange={(e) => setSettings({...settings, pix_holder_name: e.target.value})} className="input-field" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipping Tab */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-medium text-gray-800 border-b pb-3">Configurações de Frete</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Frete Grátis Acima de (R$)</label>
              <input type="number" step="0.01" value={settings.shipping_free_above} onChange={(e) => setSettings({...settings, shipping_free_above: e.target.value})} className="input-field" placeholder="Ex: 299.00" />
              <p className="text-xs text-gray-400 mt-1">Deixe em branco para desativar</p>
            </div>
            <div>
              <label className="label-field">Frete Padrão (R$)</label>
              <input type="number" step="0.01" value={settings.shipping_default_price} onChange={(e) => setSettings({...settings, shipping_default_price: e.target.value})} className="input-field" placeholder="Ex: 19.90" />
            </div>
            <div>
              <label className="label-field">Prazo Estimado (dias úteis)</label>
              <input type="number" value={settings.shipping_estimated_days} onChange={(e) => setSettings({...settings, shipping_estimated_days: e.target.value})} className="input-field" placeholder="7" />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="font-medium text-gray-800 border-b pb-3">Configurações Avançadas</h3>
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-yellow-800">Modo de Manutenção</p>
              <p className="text-sm text-yellow-600">Quando ativado, a loja exibe uma mensagem de manutenção para os visitantes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-yellow-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

        </div>
      )}
    </div>
  )
}
