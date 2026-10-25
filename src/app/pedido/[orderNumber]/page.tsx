'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Order, OrderItem } from '@/lib/types'
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor, getPaymentStatusLabel } from '@/lib/utils'
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) loadOrder()
  }, [orderNumber])

  async function loadOrder() {
    try {
      const { data: orderData } = await supabase
        .from('orders_luluca')
        .select('*')
        .eq('order_number', orderNumber)
        .single()

      if (orderData) {
        setOrder(orderData)
        const { data: itemsData } = await supabase
          .from('order_items_luluca')
          .select('*')
          .eq('order_id', orderData.id)

        if (itemsData) setItems(itemsData)
      }
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Package size={64} className="text-gray-300 mb-4" />
          <p className="text-xl font-serif text-gray-600">Pedido não encontrado</p>
          <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success */}
          <div className="text-center mb-8">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Pedido Realizado!</h1>
            <p className="text-gray-500">
              Obrigado pela sua compra. Enviamos os detalhes para o seu e-mail.
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-gray-800">Pedido #{order.order_number}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Data</p>
                <p className="font-medium">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Pagamento</p>
                <p className="font-medium">{getPaymentStatusLabel(order.payment_status)}</p>
              </div>
              <div>
                <p className="text-gray-500">Método</p>
                <p className="font-medium uppercase">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-bold text-luluca-dark">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h3 className="text-lg font-serif text-gray-800 mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-gray-500">{item.variant_info}</p>}
                    <p className="text-xs text-gray-400">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                  </div>
                  <p className="font-medium text-sm">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete</span>
                <span>{order.shipping_cost === 0 ? 'Grátis' : formatCurrency(order.shipping_cost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-luluca-dark">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/produtos" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={18} />
              Continuar Comprando
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
