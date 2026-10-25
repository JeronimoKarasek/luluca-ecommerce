'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, SubCategory } from '@/lib/types'
import { generateSlug } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Filter } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AdminSubCategoriesPage() {
  const [subcategories, setSubcategories] = useState<(SubCategory & { category?: Category })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SubCategory | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
    category_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [catRes, subRes] = await Promise.all([
      supabase.from('categories_luluca').select('*').order('sort_order'),
      supabase.from('subcategories_luluca').select('*, category:categories_luluca(*)').order('sort_order'),
    ])
    if (catRes.data) setCategories(catRes.data)
    if (subRes.data) setSubcategories(subRes.data)
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({
      name: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: subcategories.length,
      category_id: filterCategory || (categories.length > 0 ? categories[0].id : ''),
    })
    setShowModal(true)
  }

  function openEdit(sub: SubCategory) {
    setEditing(sub)
    setForm({
      name: sub.name,
      description: sub.description || '',
      image_url: sub.image_url || '',
      is_active: sub.is_active,
      sort_order: sub.sort_order,
      category_id: sub.category_id,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Nome é obrigatório'); return }
    if (!form.category_id) { toast.error('Selecione uma categoria'); return }

    try {
      const data = {
        name: form.name,
        slug: generateSlug(form.name),
        description: form.description || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        sort_order: form.sort_order,
        category_id: form.category_id,
      }

      if (editing) {
        const { error } = await supabase.from('subcategories_luluca').update(data).eq('id', editing.id)
        if (error) throw error
        toast.success('Subcategoria atualizada!')
      } else {
        const { error } = await supabase.from('subcategories_luluca').insert(data)
        if (error) throw error
        toast.success('Subcategoria criada!')
      }

      setShowModal(false)
      loadData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return
    const { error } = await supabase.from('subcategories_luluca').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir: ' + error.message)
      return
    }
    toast.success('Subcategoria excluída!')
    loadData()
  }

  async function toggleActive(sub: SubCategory) {
    await supabase.from('subcategories_luluca').update({ is_active: !sub.is_active }).eq('id', sub.id)
    loadData()
  }

  const filteredSubs = filterCategory
    ? subcategories.filter(s => s.category_id === filterCategory)
    : subcategories

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Subcategorias</h1>
          <p className="text-sm text-gray-500">{filteredSubs.length} subcategoria(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Subcategoria
        </button>
      </div>

      {/* Filtro por categoria */}
      <div className="mb-6 flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field !w-auto !py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-40 animate-pulse" />
          ))
        ) : filteredSubs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-lg font-serif">Nenhuma subcategoria encontrada</p>
            <p className="text-sm mt-2">Clique em &quot;Nova Subcategoria&quot; para criar a primeira</p>
          </div>
        ) : filteredSubs.map((sub) => (
          <div key={sub.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            {sub.image_url && (
              <div className="h-32 bg-gray-100">
                <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{sub.name}</h3>
                  <p className="text-xs text-luluca-primary mt-0.5">
                    {sub.category?.name || categories.find(c => c.id === sub.category_id)?.name || 'Sem categoria'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(sub)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    {sub.is_active ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => openEdit(sub)} className="p-1.5 text-gray-400 hover:text-luluca-primary">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {sub.description && <p className="text-sm text-gray-500 mt-1">{sub.description}</p>}
              <p className="text-xs text-gray-400 mt-2">Slug: {sub.slug}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif">{editing ? 'Editar Subcategoria' : 'Nova Subcategoria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label-field">Categoria *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Vestidos, Camisetas, Bolsas..."
                  required
                />
              </div>
              <div>
                <label className="label-field">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div>
                <label className="label-field">Imagem</label>
                <ImageUpload
                  images={form.image_url ? [form.image_url] : []}
                  onChange={(urls) => setForm({ ...form, image_url: urls[0] || '' })}
                  multiple={false}
                  folder="subcategorias"
                />
              </div>
              <div>
                <label className="label-field">Ordem</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-luluca-primary rounded"
                />
                <span className="text-sm">Subcategoria ativa</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
