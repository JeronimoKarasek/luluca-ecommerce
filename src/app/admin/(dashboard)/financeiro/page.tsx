'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FinancialTransaction } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { X, TrendingUp, TrendingDown, DollarSign, Search, Trash2, Edit2 } from 'lucide-react'

export default function AdminFinancialPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<FinancialTransaction | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

  const [form, setForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    notes: '',
  })

  const incomeCategories = ['Venda', 'Serviço', 'Outros']
  const expenseCategories = ['Fornecedor', 'Aluguel', 'Salários', 'Marketing', 'Logística', 'Impostos', 'Embalagens', 'Manutenção', 'Outros']

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    const query = supabase.from('financial_transactions_luluca').select('*').order('date', { ascending: false })
    const { data } = await query
    if (data) setTransactions(data)
    setLoading(false)
  }

  function openNew(type: 'income' | 'expense' = 'income') {
    setEditing(null)
    setForm({
      type,
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: '',
      notes: '',
    })
    setShowModal(true)
  }

  function openEdit(t: FinancialTransaction) {
    setEditing(t)
    setForm({
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount.toString(),
      date: t.date,
      payment_method: t.payment_method || '',
      notes: t.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.category) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const data = {
        type: form.type,
        category: form.category,
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      }

      if (editing) {
        await supabase.from('financial_transactions_luluca').update(data).eq('id', editing.id)
        toast.success('Transação atualizada!')
      } else {
        await supabase.from('financial_transactions_luluca').insert(data)
        toast.success('Transação adicionada!')
      }

      setShowModal(false)
      loadTransactions()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    await supabase.from('financial_transactions_luluca').delete().eq('id', id)
    toast.success('Transação excluída!')
    loadTransactions()
  }

  const filtered = transactions.filter(t => {
    const matchType = !typeFilter || t.type === typeFilter
    const matchSearch = !searchQuery ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDateStart = !dateFilter.start || t.date >= dateFilter.start
    const matchDateEnd = !dateFilter.end || t.date <= dateFilter.end
    return matchType && matchSearch && matchDateStart && matchDateEnd
  })

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Financeiro</h1>
          <p className="text-sm text-gray-500">Controle de entradas e saídas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openNew('income')} className="bg-green-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
            <TrendingUp size={16} /> Entrada
          </button>
          <button onClick={() => openNew('expense')} className="bg-red-500 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
            <TrendingDown size={16} /> Saída
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-gray-500">Total Entradas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
              <p className="text-xs text-gray-500">Total Saídas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <DollarSign size={20} className={balance >= 0 ? 'text-blue-600' : 'text-red-500'} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
              <p className="text-xs text-gray-500">Saldo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field !w-auto">
            <option value="">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="input-field !w-auto" />
          <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="input-field !w-auto" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Tipo</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Descrição</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Categoria</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Data</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Pagamento</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Valor</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhuma transação encontrada</td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {t.type === 'income' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <TrendingUp size={12} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                        <TrendingDown size={12} /> Saída
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{t.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.payment_method || '-'}</td>
                  <td className={`px-6 py-4 text-sm font-medium text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-luluca-primary"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif">{editing ? 'Editar Transação' : form.type === 'income' ? 'Nova Entrada' : 'Nova Saída'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label-field">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense', category: '' })} className="input-field">
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                </select>
              </div>
              <div>
                <label className="label-field">Categoria *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required>
                  <option value="">Selecione</option>
                  {(form.type === 'income' ? incomeCategories : expenseCategories).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Descrição *</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Valor *</label>
                <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Método de Pagamento</label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input-field">
                  <option value="">Selecione</option>
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="boleto">Boleto</option>
                  <option value="cash">Dinheiro</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
              <div>
                <label className="label-field">Observações</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
