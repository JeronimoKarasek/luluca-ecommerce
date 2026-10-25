'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Order, OrderItem } from '@/lib/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, User, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (orderId) loadOrder()
  }, [orderId])

  async function loadOrder() {
    const { data: orderData } = await supabase.from('orders_luluca').select('*').eq('id', orderId).single()
    if (orderData) {
      setOrder(orderData)
      setNotes(orderData.notes || '')
      const { data: itemsData } = await supabase.from('order_items_luluca').select('*').eq('order_id', orderId)
      if (itemsData) setItems(itemsData)
    }
    setLoading(false)
  }

  async function updateStatus(status: string) {
    await supabase.from('orders_luluca').update({ status }).eq('id', orderId)
    toast.success('Status atualizado!')
    loadOrder()
  }

  async function updatePaymentStatus(status: string) {
    await supabase.from('orders_luluca').update({ payment_status: status }).eq('id', orderId)
    toast.success('Status de pagamento atualizado!')
    loadOrder()
  }

  async function saveNotes() {
    await supabase.from('orders_luluca').update({ notes }).eq('id', orderId)
    toast.success('Notas salvas!')
  }

  if (loading) return <div className="animate-pulse text-center py-12 text-luluca-primary font-serif text-xl">Carregando...</div>
  if (!order) return <div className="text-center py-12"><p>Pedido não encontrado</p><Link href="/admin/pedidos" className="btn-primary mt-4 inline-block">Voltar</Link></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pedidos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Pedido #{order.order_number}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-serif mb-4 flex items-center gap-2"><Package size={18} /> Itens do Pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-gray-500">{item.variant_info}</p>}
                    <p className="text-xs text-gray-400">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Frete</span><span>{order.shipping_cost === 0 ? 'Grátis' : formatCurrency(order.shipping_cost)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Desconto</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span className="text-luluca-dark">{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-serif mb-4 flex items-center gap-2"><FileText size={18} /> Observações</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Adicionar observações sobre o pedido..."
            />
            <button onClick={saveNotes} className="btn-primary mt-3">Salvar Notas</button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-serif mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <label className="label-field">Status do Pedido</label>
                <select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="input-field">
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Processando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
              <div>
                <label className="label-field">Status do Pagamento</label>
                <select value={order.payment_status} onChange={(e) => updatePaymentStatus(e.target.value)} className="input-field">
                  <option value="pending">Aguardando</option>
                  <option value="paid">Pago</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
              <div>
                <label className="label-field">Método de Pagamento</label>
                <p className="text-sm font-medium uppercase">{order.payment_method || '-'}</p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-serif mb-4 flex items-center gap-2"><User size={18} /> Cliente</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-gray-500">{order.customer_email}</p>
              {order.customer_phone && <p className="text-gray-500">{order.customer_phone}</p>}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-serif mb-4 flex items-center gap-2"><MapPin size={18} /> Entrega</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {order.shipping_address && <p>{order.shipping_address}</p>}
              {order.shipping_city && <p>{order.shipping_city} - {order.shipping_state}</p>}
              {order.shipping_zip && <p>CEP: {order.shipping_zip}</p>}
              {!order.shipping_address && <p className="text-gray-400">Endereço não informado</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
