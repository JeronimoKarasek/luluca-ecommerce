'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Users, ShoppingBag, Eye, X, Mail, Phone, MapPin } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<{ id: string; order_number: string; status: string; total: number; created_at: string; order_items?: { id: string; product_name: string; quantity: number; unit_price: number }[] }[]>([])

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    const { data } = await supabase
      .from('customers_luluca')
      .select('*, orders_luluca(id, order_number, status, total, created_at)')
      .order('created_at', { ascending: false })
    if (data) setCustomers(data)
    setLoading(false)
  }

  async function viewCustomer(customer: Customer) {
    setSelectedCustomer(customer)
    const { data } = await supabase
      .from('orders_luluca')
      .select('*, order_items_luluca(id, product_name, quantity, unit_price)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
    if (data) setCustomerOrders(data)
  }

  const filtered = customers.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.cpf && c.cpf.includes(q))
    )
  })

  const totalCustomers = customers.length
  const customersWithOrders = customers.filter((c: Customer & { orders?: unknown[] }) => c.orders && c.orders.length > 0).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500">{totalCustomers} clientes cadastrados</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luluca-light/30 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-luluca-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
              <p className="text-xs text-gray-500">Total de Clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{customersWithOrders}</p>
              <p className="text-xs text-gray-500">Com Pedidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Contato</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">CPF</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Pedidos</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Cadastro</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum cliente encontrado</td></tr>
              ) : filtered.map((c: Customer & { orders?: unknown[] }) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-luluca-light/40 rounded-full flex items-center justify-center text-luluca-dark font-medium text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{c.email}</div>
                    {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.cpf || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {c.orders?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => viewCustomer(c)} className="p-1.5 text-gray-400 hover:text-luluca-primary">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-serif">Detalhes do Cliente</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-luluca-light/40 rounded-full flex items-center justify-center text-luluca-dark font-bold text-xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Cliente desde {formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.cpf && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-gray-400" />
                    <span>CPF: {selectedCustomer.cpf}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              {selectedCustomer.address_street && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">Endereço</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.address_street}, {selectedCustomer.address_number}
                    {selectedCustomer.address_complement && ` - ${selectedCustomer.address_complement}`}
                    <br />
                    {selectedCustomer.address_neighborhood} - {selectedCustomer.address_city}/{selectedCustomer.address_state}
                    <br />
                    CEP: {selectedCustomer.address_zip}
                  </p>
                </div>
              )}

              {/* Orders */}
              <div>
                <h4 className="font-medium mb-3">Histórico de Pedidos ({customerOrders.length})</h4>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum pedido encontrado</p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-luluca-primary">#{order.order_number}</span>
                          <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {order.order_items?.map((item) => (
                              <span key={item.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {item.quantity}x {item.product_name}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
