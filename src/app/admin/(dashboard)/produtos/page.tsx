'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category, SubCategory } from '@/lib/types'
import { formatCurrency, generateSlug } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Star, X, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    category_id: '',
    subcategory_id: '',
    is_active: true,
    is_featured: false,
    weight: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
      supabase
        .from('products_luluca')
        .select('*, category:categories_luluca(*), subcategory:subcategories_luluca(*), images:product_images_luluca(*)')
        .order('created_at', { ascending: false }),
      supabase.from('categories_luluca').select('*').eq('is_active', true).order('name'),
      supabase.from('subcategories_luluca').select('*').eq('is_active', true).order('sort_order'),
    ])
    if (productsRes.data) setProducts(productsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data)
    setLoading(false)
  }

  // Subcategorias filtradas pela categoria selecionada no form
  const filteredSubcategories = form.category_id
    ? subcategories.filter(s => s.category_id === form.category_id)
    : []

  function openNew() {
    setEditingProduct(null)
    setForm({
      name: '', description: '', price: '', compare_at_price: '', cost_price: '',
      sku: '', barcode: '', category_id: '', subcategory_id: '', is_active: true, is_featured: false, weight: '',
    })
    setImageUrls([])
    setShowModal(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      cost_price: product.cost_price?.toString() || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      weight: product.weight?.toString() || '',
    })
    setImageUrls(product.images?.map(img => img.url) || [])
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Nome e preço são obrigatórios')
      return
    }

    try {
      const slug = generateSlug(form.name)
      const productData = {
        name: form.name,
        slug,
        description: form.description || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        weight: form.weight ? parseFloat(form.weight) : null,
      }

      let productId: string

      if (editingProduct) {
        const { error } = await supabase
          .from('products_luluca')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
        productId = editingProduct.id

        // Delete old images
        await supabase.from('product_images_luluca').delete().eq('product_id', productId)
      } else {
        const { data, error } = await supabase
          .from('products_luluca')
          .insert(productData)
          .select()
          .single()
        if (error) throw error
        productId = data.id
      }

      // Insert images
      const validUrls = imageUrls.filter(url => url.trim())
      if (validUrls.length > 0) {
        const imagesData = validUrls.map((url, i) => ({
          product_id: productId,
          url: url.trim(),
          sort_order: i,
          is_primary: i === 0,
        }))
        await supabase.from('product_images_luluca').insert(imagesData)
      }

      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
      setShowModal(false)
      loadData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar produto')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      await supabase.from('product_images_luluca').delete().eq('product_id', id)
      await supabase.from('product_variants_luluca').delete().eq('product_id', id)
      await supabase.from('products_luluca').delete().eq('id', id)
      toast.success('Produto excluído!')
      loadData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir')
    }
  }

  async function toggleActive(product: Product) {
    await supabase.from('products_luluca').update({ is_active: !product.is_active }).eq('id', product.id)
    loadData()
  }

  async function toggleFeatured(product: Product) {
    await supabase.from('products_luluca').update({ is_featured: !product.is_featured }).eq('id', product.id)
    loadData()
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || p.category_id === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="">Todas categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Produto</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Categoria</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Preço</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">SKU</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Destaque</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Carregando...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhum produto encontrado</td></tr>
              ) : filteredProducts.map((product) => {
                const primaryImg = product.images?.find(i => i.is_primary) || product.images?.[0]
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {primaryImg ? (
                            <img src={primaryImg.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-sm">{formatCurrency(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {formatCurrency(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleActive(product)}>
                        {product.is_active ? (
                          <Eye size={18} className="text-green-500 mx-auto" />
                        ) : (
                          <EyeOff size={18} className="text-gray-400 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleFeatured(product)}>
                        <Star size={18} className={`mx-auto ${product.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-luluca-primary transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-gray-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-field">Nome do Produto *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-field">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field min-h-[100px] resize-y"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="label-field">Preço *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label-field">Preço Comparativo (de)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Preço de Custo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Categoria</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: '' })}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Subcategoria</label>
                  <select
                    value={form.subcategory_id}
                    onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                    className="input-field"
                    disabled={!form.category_id || filteredSubcategories.length === 0}
                  >
                    <option value="">{!form.category_id ? 'Selecione uma categoria primeiro' : filteredSubcategories.length === 0 ? 'Nenhuma subcategoria' : 'Selecione'}</option>
                    {filteredSubcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Código de Barras</label>
                  <input
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="label-field">Imagens</label>
                <p className="text-xs text-gray-500 mb-2">A primeira imagem será a principal. Arraste ou clique para enviar.</p>
                <ImageUpload
                  images={imageUrls}
                  onChange={setImageUrls}
                  multiple={true}
                  folder="produtos"
                  maxFiles={10}
                />
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-luluca-primary rounded border-gray-300 focus:ring-luluca-primary"
                  />
                  <span className="text-sm text-gray-700">Produto ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 text-luluca-primary rounded border-gray-300 focus:ring-luluca-primary"
                  />
                  <span className="text-sm text-gray-700">Produto em destaque</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
