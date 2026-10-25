'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('30')
  const [revenueData, setRevenueData] = useState<{ date: string; Receita: number; Despesa: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([])
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalOrders: 0,
    avgTicket: 0,
    totalCustomers: 0,
    totalProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  const COLORS = ['#c2918f', '#c9a96e', '#8c5c5c', '#d4a0a0', '#f2d1cb', '#a67c52']

  useEffect(() => {
    loadReports()
  }, [period])

  async function loadReports() {
    setLoading(true)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    const startStr = startDate.toISOString()

    // Parallel queries
    const [ordersRes, transactionsRes, customersRes, productsRes] = await Promise.all([
      supabase.from('orders_luluca').select('*, order_items_luluca(*, products_luluca(category_id, categories_luluca(name)))').gte('created_at', startStr),
      supabase.from('financial_transactions_luluca').select('*').gte('date', startDate.toISOString().split('T')[0]),
      supabase.from('customers_luluca').select('id'),
      supabase.from('products_luluca').select('id, name'),
    ])

    const orders = ordersRes.data || []
    const transactions = transactionsRes.data || []
    const customers = customersRes.data || []
    const products = productsRes.data || []

    // Summary
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalOrders = orders.length
    const avgTicket = totalOrders > 0 ? orders.reduce((s, o) => s + (o.total || 0), 0) / totalOrders : 0

    setSummaryStats({
      totalRevenue,
      totalExpenses,
      totalOrders,
      avgTicket,
      totalCustomers: customers.length,
      totalProducts: products.length,
    })

    // Revenue chart by day (group transactions)
    const revenueMap: Record<string, { date: string; income: number; expense: number }> = {}
    transactions.forEach(t => {
      const d = t.date
      if (!revenueMap[d]) revenueMap[d] = { date: d, income: 0, expense: 0 }
      if (t.type === 'income') revenueMap[d].income += t.amount
      else revenueMap[d].expense += t.amount
    })
    const sortedRevenue = Object.values(revenueMap).sort((a, b) => a.date.localeCompare(b.date))
    setRevenueData(sortedRevenue.map(r => ({
      date: new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Receita: r.income,
      Despesa: r.expense,
    })))

    // Category breakdown from orders
    const catMap: Record<string, number> = {}
    orders.forEach(o => {
      o.order_items?.forEach((item: { products?: { categories?: { name: string } }; quantity: number; unit_price: number }) => {
        const catName = item.products?.categories?.name || 'Sem Categoria'
        catMap[catName] = (catMap[catName] || 0) + item.quantity * item.unit_price
      })
    })
    setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })))

    // Top products
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {}
    orders.forEach(o => {
      o.order_items?.forEach((item: { product_name: string; product_id: string; quantity: number; unit_price: number }) => {
        const key = item.product_name || item.product_id
        if (!productMap[key]) productMap[key] = { name: item.product_name, qty: 0, revenue: 0 }
        productMap[key].qty += item.quantity
        productMap[key].revenue += item.quantity * item.unit_price
      })
    })
    setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10))

    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Relatórios</h1>
          <p className="text-sm text-gray-500">Análise de performance da loja</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field !w-auto">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-luluca-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Receita', value: formatCurrency(summaryStats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Despesas', value: formatCurrency(summaryStats.totalExpenses), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Lucro', value: formatCurrency(summaryStats.totalRevenue - summaryStats.totalExpenses), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pedidos', value: summaryStats.totalOrders.toString(), icon: ShoppingBag, color: 'text-luluca-primary', bg: 'bg-luluca-light/30' },
              { label: 'Ticket Médio', value: formatCurrency(summaryStats.avgTicket), icon: BarChart3, color: 'text-luluca-gold', bg: 'bg-amber-50' },
              { label: 'Clientes', value: summaryStats.totalCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-serif text-gray-800 mb-4">Receita vs Despesas</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-12">Sem dados para o período selecionado</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-serif text-gray-800 mb-4">Vendas por Categoria</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100} dataKey="value">
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">Sem dados</p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-serif text-gray-800 mb-4">Produtos Mais Vendidos</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-luluca-light/40 rounded-full flex items-center justify-center text-xs font-bold text-luluca-dark">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.qty} vendidos</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">Sem dados</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
