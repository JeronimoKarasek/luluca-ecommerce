'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'
import { generateSlug } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', image_url: '', is_active: true, sort_order: 0 })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data } = await supabase.from('categories_luluca').select('*').order('sort_order')
    if (data) setCategories(data)
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', description: '', image_url: '', is_active: true, sort_order: categories.length })
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Nome é obrigatório'); return }

    try {
      const data = {
        name: form.name,
        slug: generateSlug(form.name),
        description: form.description || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        sort_order: form.sort_order,
      }

      if (editing) {
        const { error } = await supabase.from('categories_luluca').update(data).eq('id', editing.id)
        if (error) throw error
        toast.success('Categoria atualizada!')
      } else {
        const { error } = await supabase.from('categories_luluca').insert(data)
        if (error) throw error
        toast.success('Categoria criada!')
      }

      setShowModal(false)
      loadCategories()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza? Produtos desta categoria ficarão sem categoria.')) return
    await supabase.from('categories_luluca').delete().eq('id', id)
    toast.success('Categoria excluída!')
    loadCategories()
  }

  async function toggleActive(cat: Category) {
    await supabase.from('categories_luluca').update({ is_active: !cat.is_active }).eq('id', cat.id)
    loadCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-500">{categories.length} categoria(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-40 animate-pulse" />
          ))
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            {cat.image_url && (
              <div className="h-32 bg-gray-100">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">{cat.name}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(cat)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    {cat.is_active ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-luluca-primary">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
              <p className="text-xs text-gray-400 mt-2">Slug: {cat.slug}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label-field">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="label-field">Imagem</label>
                <ImageUpload
                  images={form.image_url ? [form.image_url] : []}
                  onChange={(urls) => setForm({ ...form, image_url: urls[0] || '' })}
                  multiple={false}
                  folder="categorias"
                />
              </div>
              <div>
                <label className="label-field">Ordem</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })} className="input-field" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-luluca-primary rounded" />
                <span className="text-sm">Categoria ativa</span>
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
