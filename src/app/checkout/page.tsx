'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateOrderNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ShoppingBag, Lock, ArrowLeft, CreditCard, QrCode, Barcode,
  CheckCircle2, Copy, Clock, ArrowRight, Loader2, Truck, MapPin, PackageCheck
} from 'lucide-react'

type CheckoutStep = 'dados' | 'pagamento' | 'confirmado'

type PaymentSettings = {
  pix_enabled: boolean
  pix_key: string
  pix_key_type: string
  pix_holder_name: string
  mp_enabled: boolean
  asaas_enabled: boolean
  shipping_free_above: string
  shipping_default_price: string
  pickup_address: string
  pickup_hours: string
  reserve_max_days: string
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('dados')
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderId, setOrderId] = useState('')
  const [pixCopied, setPixCopied] = useState(false)
  const [paymentConfirming, setPaymentConfirming] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    pix_enabled: true,
    pix_key: '',
    pix_key_type: 'cpf',
    pix_holder_name: '',
    mp_enabled: false,
    asaas_enabled: false,
    shipping_free_above: '',
    shipping_default_price: '19.90',
    pickup_address: '',
    pickup_hours: '',
    reserve_max_days: '30',
  })

  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada' | 'reservado'>('entrega')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
  })

  const subtotal = getTotal()
  const freeAbove = paymentSettings.shipping_free_above ? parseFloat(paymentSettings.shipping_free_above) : 0
  const defaultShipping = paymentSettings.shipping_default_price ? parseFloat(paymentSettings.shipping_default_price) : 19.90
  const shippingCost = deliveryType === 'entrega' ? (freeAbove > 0 && subtotal >= freeAbove ? 0 : defaultShipping) : 0
  const discount = paymentMethod === 'pix' ? subtotal * 0.05 : 0
  const total = subtotal + shippingCost - discount

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('store_settings_luluca').select('*')
      if (data && data.length > 0) {
        const loaded: Record<string, string | boolean> = {}
        data.forEach((s: { key: string; value: string }) => {
          if (s.value === 'true') loaded[s.key] = true
          else if (s.value === 'false') loaded[s.key] = false
          else loaded[s.key] = s.value
        })
        setPaymentSettings(prev => ({ ...prev, ...loaded }))
      }
      setSettingsLoaded(true)
    }
    loadSettings()
  }, [])

  const generatePixPayload = useCallback(() => {
    const key = paymentSettings.pix_key
    const name = paymentSettings.pix_holder_name || 'LULUCA'
    const city = 'SAO PAULO'
    const txid = orderNumber || 'LULUCA'
    const amount = total.toFixed(2)
    const payload = [
      '000201','010212',
      '2658','0014BR.GOV.BCB.PIX',
      `01${String(key.length).padStart(2, '0')}${key}`,
      '52040000','5303986',
      `54${String(amount.length).padStart(2, '0')}${amount}`,
      '5802BR',
      `59${String(name.length).padStart(2, '0')}${name}`,
      `60${String(city.length).padStart(2, '0')}${city}`,
      `62${String(txid.length + 4).padStart(2, '0')}`,
      `05${String(txid.length).padStart(2, '0')}${txid}`,
      '6304',
    ].join('')
    return payload
  }, [paymentSettings, total, orderNumber])

  const getQrCodeUrl = useCallback(() => {
    if (paymentSettings.pix_key) {
      const pixCode = generatePixPayload()
      return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`
    }
    return ''
  }, [paymentSettings.pix_key, generatePixPayload])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Sua sacola est\u00e1 vazia'); return }
    if (!formData.name || !formData.email || !formData.phone) { toast.error('Preencha os campos obrigat\u00f3rios'); return }

    setLoading(true)
    try {
      const newOrderNumber = generateOrderNumber()

      const { data: customer } = await supabase
        .from('customers_luluca')
        .upsert({
          name: formData.name, email: formData.email, phone: formData.phone,
          cpf: formData.cpf || null,
          address_street: formData.address_street || null, address_number: formData.address_number || null,
          address_complement: formData.address_complement || null, address_neighborhood: formData.address_neighborhood || null,
          address_city: formData.address_city || null, address_state: formData.address_state || null,
          address_zip: formData.address_zip || null,
        }, { onConflict: 'email' })
        .select().single()

      const { data: order, error: orderError } = await supabase
        .from('orders_luluca')
        .insert({
          order_number: newOrderNumber, customer_id: customer?.id,
          customer_name: formData.name, customer_email: formData.email, customer_phone: formData.phone,
          delivery_type: deliveryType,
          shipping_address: deliveryType === 'entrega'
            ? `${formData.address_street}, ${formData.address_number} ${formData.address_complement}`.trim()
            : deliveryType === 'retirada'
              ? `RETIRADA NA LOJA: ${paymentSettings.pickup_address || 'a combinar'}`
              : `RESERVADO (até ${paymentSettings.reserve_max_days || '30'} dias) - acumular para envio único`,
          shipping_city: deliveryType === 'entrega' ? formData.address_city : null,
          shipping_state: deliveryType === 'entrega' ? formData.address_state : null,
          shipping_zip: deliveryType === 'entrega' ? formData.address_zip : null,
          subtotal, shipping_cost: shippingCost, discount, total,
          status: 'pending', payment_status: 'pending', payment_method: paymentMethod,
        })
        .select().single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id, product_id: item.product.id,
        variant_id: item.variant?.id || null, product_name: item.product.name,
        variant_info: item.variant ? `${item.variant.size || ''} ${item.variant.color || ''}`.trim() : null,
        quantity: item.quantity,
        unit_price: item.product.price + (item.variant?.price_modifier || 0),
        total_price: (item.product.price + (item.variant?.price_modifier || 0)) * item.quantity,
      }))

      await supabase.from('order_items_luluca').insert(orderItems)

      setOrderNumber(newOrderNumber)
      setOrderId(order.id)
      setStep('pagamento')
      toast.success('Pedido criado! Agora efetue o pagamento.')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setPaymentConfirming(true)
    try {
      await supabase.from('orders_luluca').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', orderId)

      await supabase.from('financial_transactions_luluca').insert({
        type: 'income', category: 'Venda', description: `Pedido ${orderNumber}`,
        amount: total, date: new Date().toISOString().split('T')[0],
        order_id: orderId, payment_method: paymentMethod,
      })

      for (const item of items) {
        if (item.variant) {
          await supabase.from('product_variants_luluca')
            .update({ stock_quantity: item.variant.stock_quantity - item.quantity })
            .eq('id', item.variant.id)
        }
      }

      clearCart()
      setStep('confirmado')
      toast.success('Pagamento confirmado!')
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast.error('Erro ao confirmar pagamento.')
    } finally {
      setPaymentConfirming(false)
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(paymentSettings.pix_key)
    setPixCopied(true)
    toast.success('Chave PIX copiada!')
    setTimeout(() => setPixCopied(false), 3000)
  }

  if (items.length === 0 && step === 'dados') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <ShoppingBag size={64} className="text-luluca-light mb-4" />
          <h2 className="text-2xl font-serif text-gray-800 mb-2">Sua sacola est\u00e1 vazia</h2>
          <p className="text-gray-500 mb-6">Adicione produtos antes de finalizar a compra</p>
          <Link href="/produtos" className="btn-primary">Continuar comprando</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  if (step === 'confirmado') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-12">
          <div className="max-w-lg mx-auto px-4 text-center">
            <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-gray-800 mb-3">Pagamento Confirmado!</h1>
            <p className="text-gray-500 mb-2">Seu pedido <span className="font-bold text-luluca-dark">#{orderNumber}</span> foi confirmado com sucesso.</p>
            <p className="text-gray-400 text-sm mb-8">Enviamos os detalhes para o seu e-mail.</p>
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6 text-left">
              <h3 className="font-serif text-gray-800 mb-3">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Pedido</span><span className="font-medium">#{orderNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pagamento</span><span className="font-medium text-green-600">Confirmado</span></div>
                <div className="flex justify-between"><span className="text-gray-500">M\u00e9todo</span><span className="font-medium uppercase">{paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'credit_card' ? 'Cart\u00e3o' : 'Boleto'}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Total</span><span className="font-bold text-luluca-dark">{formatCurrency(total)}</span></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/pedido/${orderNumber}`} className="btn-primary inline-flex items-center justify-center gap-2">Ver Pedido <ArrowRight size={16} /></Link>
              <Link href="/produtos" className="btn-secondary inline-flex items-center justify-center gap-2"><ShoppingBag size={16} /> Continuar Comprando</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (step === 'pagamento') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-serif text-gray-800 mb-4">Pagamento</h1>
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm"><CheckCircle2 size={16} /></div><span className="text-sm text-green-600 font-medium">Dados</span></div>
              <div className="flex-1 h-0.5 bg-luluca-primary" />
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-luluca-primary text-white flex items-center justify-center text-sm font-medium">2</div><span className="text-sm text-luluca-primary font-medium">Pagamento</span></div>
              <div className="flex-1 h-0.5 bg-gray-200" />
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">3</div><span className="text-sm text-gray-400">Confirma\u00e7\u00e3o</span></div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Pedido</p><p className="font-bold text-luluca-dark">#{orderNumber}</p></div>
              <div className="text-right"><p className="text-sm text-gray-500">Total a pagar</p><p className="text-xl font-bold text-luluca-dark">{formatCurrency(total)}</p></div>
            </div>

            {paymentMethod === 'pix' && paymentSettings.pix_key && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><QrCode size={24} className="text-green-600" /></div>
                  <div><h2 className="text-lg font-serif text-gray-800">Pagamento via PIX</h2><p className="text-sm text-gray-500">Escaneie o QR Code ou copie a chave</p></div>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-4">
                    <img src={getQrCodeUrl()} alt="QR Code PIX" className="w-[250px] h-[250px]" />
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Aponte a c\u00e2mera do seu banco para o QR Code</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-1">Chave PIX ({paymentSettings.pix_key_type?.toUpperCase()})</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 break-all">{paymentSettings.pix_key}</code>
                    <button onClick={copyPixCode} className="flex items-center gap-1 px-3 py-2 bg-luluca-primary text-white rounded-lg text-sm hover:bg-luluca-dark transition-colors">
                      <Copy size={14} />{pixCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  {paymentSettings.pix_holder_name && <p className="text-xs text-gray-500 mt-2">Titular: <span className="font-medium">{paymentSettings.pix_holder_name}</span></p>}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between"><span className="text-green-700 font-medium">Valor a transferir</span><span className="text-2xl font-bold text-green-700">{formatCurrency(total)}</span></div>
                  {discount > 0 && <p className="text-xs text-green-600 mt-1">Desconto de 5% via PIX j\u00e1 aplicado</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-6"><Clock size={16} /><span>Efetue o pagamento e clique em confirmar abaixo</span></div>
                <button onClick={handleConfirmPayment} disabled={paymentConfirming} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3 disabled:opacity-50">
                  {paymentConfirming ? <><Loader2 size={20} className="animate-spin" />Confirmando...</> : <><CheckCircle2 size={20} />J\u00e1 fiz o PIX - Confirmar Pagamento</>}
                </button>
              </div>
            )}

            {paymentMethod === 'credit_card' && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><CreditCard size={24} className="text-blue-600" /></div>
                  <div><h2 className="text-lg font-serif text-gray-800">Pagamento com Cart\u00e3o</h2><p className="text-sm text-gray-500">Preencha os dados do cart\u00e3o</p></div>
                </div>
                {paymentSettings.mp_enabled || paymentSettings.asaas_enabled ? (
                  <div className="space-y-4">
                    <div><label className="label-field">N\u00famero do Cart\u00e3o *</label><input className="input-field" placeholder="0000 0000 0000 0000" maxLength={19} /></div>
                    <div><label className="label-field">Nome no Cart\u00e3o *</label><input className="input-field" placeholder="Como est\u00e1 no cart\u00e3o" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="label-field">Validade *</label><input className="input-field" placeholder="MM/AA" maxLength={5} /></div>
                      <div><label className="label-field">CVV *</label><input className="input-field" placeholder="000" maxLength={4} type="password" /></div>
                    </div>
                    <div><label className="label-field">Parcelas</label>
                      <select className="input-field">
                        <option value="1">1x de {formatCurrency(total)} sem juros</option>
                        <option value="2">2x de {formatCurrency(total / 2)} sem juros</option>
                        <option value="3">3x de {formatCurrency(total / 3)} sem juros</option>
                      </select>
                    </div>
                    <button onClick={handleConfirmPayment} disabled={paymentConfirming} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3 mt-4 disabled:opacity-50">
                      {paymentConfirming ? <><Loader2 size={20} className="animate-spin" />Processando...</> : <><Lock size={18} />Pagar {formatCurrency(total)}</>}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8"><CreditCard size={48} className="text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-2">Gateway de pagamento n\u00e3o configurado</p><p className="text-sm text-gray-400">Configure Mercado Pago ou Asaas nas configura\u00e7\u00f5es.</p><button onClick={() => setStep('dados')} className="btn-secondary mt-4">Voltar e escolher outro m\u00e9todo</button></div>
                )}
              </div>
            )}

            {paymentMethod === 'boleto' && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center"><Barcode size={24} className="text-orange-600" /></div>
                  <div><h2 className="text-lg font-serif text-gray-800">Pagamento por Boleto</h2><p className="text-sm text-gray-500">O boleto vence em 3 dias \u00fateis</p></div>
                </div>
                {paymentSettings.mp_enabled || paymentSettings.asaas_enabled ? (
                  <div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between"><span className="text-orange-700 font-medium">Valor do boleto</span><span className="text-2xl font-bold text-orange-700">{formatCurrency(total)}</span></div>
                      <p className="text-xs text-orange-600 mt-1">Confirma\u00e7\u00e3o pode levar at\u00e9 2 dias \u00fateis</p>
                    </div>
                    <button onClick={handleConfirmPayment} disabled={paymentConfirming} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3 disabled:opacity-50">
                      {paymentConfirming ? <><Loader2 size={20} className="animate-spin" />Gerando boleto...</> : <><Barcode size={20} />Gerar Boleto</>}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8"><Barcode size={48} className="text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-2">Gateway n\u00e3o configurado</p><p className="text-sm text-gray-400">Configure Mercado Pago ou Asaas.</p><button onClick={() => setStep('dados')} className="btn-secondary mt-4">Voltar e escolher outro</button></div>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400"><Lock size={12} />Pagamento 100% seguro</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/produtos" className="text-gray-500 hover:text-luluca-primary transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-serif text-gray-800">Finalizar Compra</h1>
          </div>
          <div className="flex items-center gap-2 mb-8 max-w-2xl">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-luluca-primary text-white flex items-center justify-center text-sm font-medium">1</div><span className="text-sm text-luluca-primary font-medium">Dados</span></div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">2</div><span className="text-sm text-gray-400">Pagamento</span></div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">3</div><span className="text-sm text-gray-400">Confirma\u00e7\u00e3o</span></div>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-serif text-gray-800 mb-4">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="label-field">Nome completo *</label><input name="name" value={formData.name} onChange={handleInputChange} required className="input-field" placeholder="Seu nome completo" /></div>
                    <div><label className="label-field">E-mail *</label><input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="input-field" placeholder="seu@email.com" /></div>
                    <div><label className="label-field">Telefone *</label><input name="phone" value={formData.phone} onChange={handleInputChange} required className="input-field" placeholder="(00) 00000-0000" /></div>
                    <div><label className="label-field">CPF</label><input name="cpf" value={formData.cpf} onChange={handleInputChange} className="input-field" placeholder="000.000.000-00" /></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-serif text-gray-800 mb-4">Como voc\u00ea quer receber?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                    <button type="button" onClick={() => setDeliveryType('entrega')}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${deliveryType === 'entrega' ? 'border-luluca-gold bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                      <Truck size={22} className="text-luluca-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-luluca-navy">Entrega</p>
                        <p className="text-xs text-gray-500">Receber no meu endere\u00e7o</p>
                      </div>
                    </button>
                    <button type="button" onClick={() => setDeliveryType('retirada')}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${deliveryType === 'retirada' ? 'border-luluca-gold bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                      <MapPin size={22} className="text-luluca-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-luluca-navy">Retirada</p>
                        <p className="text-xs text-gray-500">Buscar no endere\u00e7o da loja</p>
                      </div>
                    </button>
                    <button type="button" onClick={() => setDeliveryType('reservado')}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${deliveryType === 'reservado' ? 'border-luluca-gold bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                      <PackageCheck size={22} className="text-luluca-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-luluca-navy">Deixar Reservado</p>
                        <p className="text-xs text-gray-500">Acumular compras</p>
                      </div>
                    </button>
                  </div>

                  {deliveryType === 'entrega' && (
                  <div className="pt-4">
                  <h3 className="text-md font-serif text-gray-700 mb-4">Endere\u00e7o de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="label-field">CEP</label><input name="address_zip" value={formData.address_zip} onChange={handleInputChange} className="input-field" placeholder="00000-000" /></div>
                    <div className="md:col-span-2"><label className="label-field">Rua</label><input name="address_street" value={formData.address_street} onChange={handleInputChange} className="input-field" placeholder="Nome da rua" /></div>
                    <div><label className="label-field">N\u00famero</label><input name="address_number" value={formData.address_number} onChange={handleInputChange} className="input-field" placeholder="N\u00ba" /></div>
                    <div><label className="label-field">Complemento</label><input name="address_complement" value={formData.address_complement} onChange={handleInputChange} className="input-field" placeholder="Apto, Bloco..." /></div>
                    <div><label className="label-field">Bairro</label><input name="address_neighborhood" value={formData.address_neighborhood} onChange={handleInputChange} className="input-field" placeholder="Bairro" /></div>
                    <div><label className="label-field">Cidade</label><input name="address_city" value={formData.address_city} onChange={handleInputChange} className="input-field" placeholder="Cidade" /></div>
                    <div><label className="label-field">Estado</label><select name="address_state" value={formData.address_state} onChange={handleInputChange} className="input-field"><option value="">Selecione</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  </div>
                  </div>
                  )}

                  {deliveryType === 'retirada' && (
                  <div className="pt-4">
                    <div className="bg-luluca-cream border border-luluca-gold/40 rounded-lg p-4">
                      <p className="text-sm font-bold text-luluca-navy mb-1">Retirada na loja</p>
                      <p className="text-sm text-luluca-navy/80">{paymentSettings.pickup_address || 'O endere\u00e7o de retirada ser\u00e1 confirmado pelo WhatsApp ap\u00f3s o pedido \ud83d\udc9b'}</p>
                      {paymentSettings.pickup_hours && <p className="text-xs text-luluca-navy/60 mt-1">Hor\u00e1rio: {paymentSettings.pickup_hours}</p>}
                      <p className="text-xs text-luluca-navy/60 mt-2">Sem custo de frete \ud83d\udc9b</p>
                    </div>
                  </div>
                  )}

                  {deliveryType === 'reservado' && (
                  <div className="pt-4">
                    <div className="bg-luluca-cream border border-luluca-gold/40 rounded-lg p-4">
                      <p className="text-sm font-bold text-luluca-navy mb-1">Deixar meu pedido reservado</p>
                      <p className="text-sm text-luluca-navy/80 mb-2">
                        Guardamos suas pecinhas reservadas por at\u00e9 <b>{paymentSettings.reserve_max_days || '30'} dias</b> para voc\u00ea acumular compras e receber tudo em um \u00fanico envio \ud83d\udc9b
                      </p>
                      <p className="text-xs text-luluca-navy/60">Sem frete agora \u2014 o frete ser\u00e1 cobrado apenas quando voc\u00ea fechar o envio do acumulado.</p>
                    </div>
                  </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-serif text-gray-800 mb-4">Forma de Pagamento</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {paymentSettings.pix_enabled && paymentSettings.pix_key && (
                      <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex items-center gap-3 p-4 rounded-md border-2 transition-colors ${paymentMethod === 'pix' ? 'border-luluca-primary bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                        <QrCode size={24} className="text-luluca-primary" /><div className="text-left"><p className="font-medium text-sm">PIX</p><p className="text-xs text-green-600">5% de desconto</p></div>
                      </button>
                    )}
                    {(paymentSettings.mp_enabled || paymentSettings.asaas_enabled) && (
                      <button type="button" onClick={() => setPaymentMethod('credit_card')} className={`flex items-center gap-3 p-4 rounded-md border-2 transition-colors ${paymentMethod === 'credit_card' ? 'border-luluca-primary bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                        <CreditCard size={24} className="text-luluca-primary" /><div className="text-left"><p className="font-medium text-sm">Cart\u00e3o</p><p className="text-xs text-gray-500">at\u00e9 3x sem juros</p></div>
                      </button>
                    )}
                    {(paymentSettings.mp_enabled || paymentSettings.asaas_enabled) && (
                      <button type="button" onClick={() => setPaymentMethod('boleto')} className={`flex items-center gap-3 p-4 rounded-md border-2 transition-colors ${paymentMethod === 'boleto' ? 'border-luluca-primary bg-luluca-cream' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Barcode size={24} className="text-luluca-primary" /><div className="text-left"><p className="font-medium text-sm">Boleto</p><p className="text-xs text-gray-500">Venc. em 3 dias</p></div>
                      </button>
                    )}
                  </div>
                  {!settingsLoaded && <div className="flex items-center gap-2 mt-4 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" />Carregando m\u00e9todos...</div>}
                  {settingsLoaded && !paymentSettings.pix_key && !paymentSettings.mp_enabled && !paymentSettings.asaas_enabled && (
                    <p className="text-sm text-amber-600 mt-4">Nenhum m\u00e9todo de pagamento configurado. Entre em contato com a loja.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                  <h2 className="text-lg font-serif text-gray-800 mb-4">Resumo do Pedido</h2>
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-3">
                        <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={16} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          {item.variant && <p className="text-xs text-gray-500">{item.variant.size} {item.variant.color}</p>}
                          <p className="text-sm text-luluca-primary font-medium mt-1">{item.quantity}x {formatCurrency(item.product.price + (item.variant?.price_modifier || 0))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{deliveryType === 'entrega' ? 'Frete' : deliveryType === 'retirada' ? 'Retirada na loja' : 'Reserva'}</span><span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'Gr\u00e1tis' : formatCurrency(shippingCost)}</span></div>
                    {deliveryType === 'reservado' && <p className="text-xs text-luluca-gold-deep">Reservado at\u00e9 {paymentSettings.reserve_max_days || '30'} dias p/ acumular e enviar junto</p>}
                    {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Desconto PIX (5%)</span><span className="text-green-600">-{formatCurrency(discount)}</span></div>}
                    <div className="border-t border-gray-100 pt-3 flex justify-between"><span className="text-lg font-semibold">Total</span><span className="text-lg font-bold text-luluca-dark">{formatCurrency(total)}</span></div>
                  </div>
                  <button type="submit" disabled={loading || (!paymentSettings.pix_key && !paymentSettings.mp_enabled && !paymentSettings.asaas_enabled)} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <><Loader2 size={16} className="animate-spin" />Processando...</> : <><ArrowRight size={16} />Ir para Pagamento</>}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400"><Lock size={12} />Pagamento 100% seguro</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}