'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueToday: 0,
    ordersToday: 0,
  })
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; revenue: number }[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<{ name: string; value: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<{ id: string; order_number: string; customer_name: string; total: number; status: string }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get counts
      const [ordersRes, customersRes, productsRes, revenueRes, todayOrdersRes, recentRes] = await Promise.all([
        supabase.from('orders_luluca').select('id', { count: 'exact', head: true }),
        supabase.from('customers_luluca').select('id', { count: 'exact', head: true }),
        supabase.from('products_luluca').select('id', { count: 'exact', head: true }),
        supabase.from('orders_luluca').select('total').eq('payment_status', 'paid'),
        supabase.from('orders_luluca').select('total').gte('created_at', today + 'T00:00:00'),
        supabase.from('orders_luluca').select('*').order('created_at', { ascending: false }).limit(10),
      ])

      const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + o.total, 0) || 0
      const revenueToday = todayOrdersRes.data?.reduce((sum, o) => sum + o.total, 0) || 0

      setStats({
        totalRevenue,
        totalOrders: ordersRes.count || 0,
        totalCustomers: customersRes.count || 0,
        totalProducts: productsRes.count || 0,
        revenueToday,
        ordersToday: todayOrdersRes.data?.length || 0,
      })

      if (recentRes.data) setRecentOrders(recentRes.data)

      // Revenue by month (last 6 months)
      const months: { month: string; revenue: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthStr = d.toLocaleString('pt-BR', { month: 'short' })
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

        const { data: monthOrders } = await supabase
          .from('orders_luluca')
          .select('total')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
          .eq('payment_status', 'paid')

        months.push({
          month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1),
          revenue: monthOrders?.reduce((sum, o) => sum + o.total, 0) || 0,
        })
      }
      setRevenueByMonth(months)

      // Orders by status
      const { data: allOrders } = await supabase.from('orders_luluca').select('status')
      if (allOrders) {
        const statusCount: Record<string, number> = {}
        allOrders.forEach(o => {
          statusCount[o.status] = (statusCount[o.status] || 0) + 1
        })
        setOrdersByStatus(Object.entries(statusCount).map(([status, count]) => ({
          name: getStatusLabel(status),
          value: count,
        })))
      }

      // Top products
      const { data: orderItems } = await supabase
        .from('order_items_luluca')
        .select('product_name, quantity, total_price')

      if (orderItems) {
        const productMap: Record<string, { quantity: number; revenue: number }> = {}
        orderItems.forEach(item => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { quantity: 0, revenue: 0 }
          }
          productMap[item.product_name].quantity += item.quantity
          productMap[item.product_name].revenue += item.total_price
        })
        const sorted = Object.entries(productMap)
          .sort(([, a], [, b]) => b.revenue - a.revenue)
          .slice(0, 5)
          .map(([name, data]) => ({ name, ...data }))
        setTopProducts(sorted)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#c2918f', '#c9a96e', '#8c5c5c', '#d4a0a0', '#f2d1cb', '#744d4d']

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral da sua loja</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
              Hoje: {formatCurrency(stats.revenueToday)}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">Receita Total</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
              Hoje: {stats.ordersToday}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Total de Pedidos</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
          <p className="text-sm text-gray-500 mt-1">Clientes</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-1">Produtos</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif text-gray-800 mb-4">Receita por Mês</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f2d1cb' }}
                />
                <Bar dataKey="revenue" fill="#c2918f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif text-gray-800 mb-4">Pedidos por Status</h3>
          <div className="h-72">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ordersByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Nenhum pedido ainda
              </div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {ordersByStatus.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif text-gray-800">Pedidos Recentes</h3>
            <Link href="/admin/pedidos" className="text-sm text-luluca-primary hover:text-luluca-dark flex items-center gap-1">
              Ver todos <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </Link>
            )) : (
              <p className="text-gray-400 text-sm text-center py-8">Nenhum pedido ainda</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif text-gray-800 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-luluca-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-luluca-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} vendido(s)</p>
                  </div>
                </div>
                <p className="font-medium text-sm text-luluca-dark">{formatCurrency(product.revenue)}</p>
              </div>
            )) : (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma venda ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
