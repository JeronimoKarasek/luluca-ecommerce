'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, ProductVariant } from '@/lib/types'
import toast from 'react-hot-toast'
import { Package, Plus, Edit2, Trash2, X, AlertTriangle, Search } from 'lucide-react'

export default function AdminStockPage() {
  const [products, setProducts] = useState<(Product & { variants: ProductVariant[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [variantForm, setVariantForm] = useState({
    size: '', color: '', stock_quantity: '', sku: '', price_modifier: '0', is_active: true,
  })
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products_luluca')
      .select('*, variants:product_variants_luluca(*), images:product_images_luluca(*)')
      .order('name')
    if (data) setProducts(data as (Product & { variants: ProductVariant[] })[])
    setLoading(false)
  }

  function openAddVariant(product: Product) {
    setSelectedProduct(product)
    setEditingVariant(null)
    setVariantForm({ size: '', color: '', stock_quantity: '', sku: '', price_modifier: '0', is_active: true })
    setShowModal(true)
  }

  function openEditVariant(product: Product, variant: ProductVariant) {
    setSelectedProduct(product)
    setEditingVariant(variant)
    setVariantForm({
      size: variant.size || '',
      color: variant.color || '',
      stock_quantity: variant.stock_quantity.toString(),
      sku: variant.sku || '',
      price_modifier: variant.price_modifier.toString(),
      is_active: variant.is_active,
    })
    setShowModal(true)
  }

  async function handleSubmitVariant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      const data = {
        product_id: selectedProduct.id,
        size: variantForm.size || null,
        color: variantForm.color || null,
        stock_quantity: parseInt(variantForm.stock_quantity) || 0,
        sku: variantForm.sku || null,
        price_modifier: parseFloat(variantForm.price_modifier) || 0,
        is_active: variantForm.is_active,
      }

      if (editingVariant) {
        const { error } = await supabase.from('product_variants_luluca').update(data).eq('id', editingVariant.id)
        if (error) throw error
        toast.success('Variante atualizada!')
      } else {
        const { error } = await supabase.from('product_variants_luluca').insert(data)
        if (error) throw error
        toast.success('Variante adicionada!')
      }

      setShowModal(false)
      loadProducts()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
  }

  async function deleteVariant(id: string) {
    if (!confirm('Excluir esta variante?')) return
    await supabase.from('product_variants_luluca').delete().eq('id', id)
    toast.success('Variante excluída!')
    loadProducts()
  }

  async function updateStock(variantId: string, newQuantity: number) {
    await supabase.from('product_variants_luluca').update({ stock_quantity: newQuantity }).eq('id', variantId)
    loadProducts()
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)
  const lowStock = products.reduce((sum, p) =>
    sum + (p.variants?.filter(v => v.stock_quantity > 0 && v.stock_quantity <= 5).length || 0), 0
  )
  const outOfStock = products.reduce((sum, p) =>
    sum + (p.variants?.filter(v => v.stock_quantity <= 0).length || 0), 0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Controle de Estoque</h1>
          <p className="text-sm text-gray-500">{totalVariants} variantes cadastradas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalVariants}</p>
              <p className="text-xs text-gray-500">Total de Variantes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
              <p className="text-xs text-gray-500">Estoque Baixo (≤ 5)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              <p className="text-xs text-gray-500">Sem Estoque</p>
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
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Products */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-400">Carregando...</div>
        ) : filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={16} /></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-500">SKU: {product.sku || '-'}</p>
                </div>
              </div>
              <button onClick={() => openAddVariant(product)} className="text-sm text-luluca-primary hover:text-luluca-dark flex items-center gap-1 font-medium">
                <Plus size={16} /> Variante
              </button>
            </div>

            {product.variants && product.variants.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-50">
                    <th className="text-left px-4 py-2">Tamanho</th>
                    <th className="text-left px-4 py-2">Cor</th>
                    <th className="text-left px-4 py-2">SKU</th>
                    <th className="text-center px-4 py-2">Estoque</th>
                    <th className="text-center px-4 py-2">Mod. Preço</th>
                    <th className="text-center px-4 py-2">Ativo</th>
                    <th className="text-right px-4 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{variant.size || '-'}</td>
                      <td className="px-4 py-3 text-sm">{variant.color || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{variant.sku || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={variant.stock_quantity}
                          onChange={(e) => updateStock(variant.id, parseInt(e.target.value) || 0)}
                          className={`w-20 text-center text-sm border rounded px-2 py-1 ${
                            variant.stock_quantity <= 0
                              ? 'border-red-300 bg-red-50 text-red-600'
                              : variant.stock_quantity <= 5
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-600'
                              : 'border-gray-200'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {variant.price_modifier !== 0 ? `R$ ${variant.price_modifier.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${variant.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditVariant(product, variant)} className="p-1.5 text-gray-400 hover:text-luluca-primary">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteVariant(variant.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma variante cadastrada</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-serif">{editingVariant ? 'Editar Variante' : 'Nova Variante'}</h2>
                <p className="text-sm text-gray-500">{selectedProduct?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitVariant} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tamanho</label>
                  <input value={variantForm.size} onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })} className="input-field" placeholder="P, M, G, GG..." />
                </div>
                <div>
                  <label className="label-field">Cor</label>
                  <input value={variantForm.color} onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })} className="input-field" placeholder="Preto, Branco..." />
                </div>
              </div>
              <div>
                <label className="label-field">Quantidade em Estoque *</label>
                <input type="number" value={variantForm.stock_quantity} onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="label-field">SKU da Variante</label>
                <input value={variantForm.sku} onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Modificador de Preço (R$)</label>
                <input type="number" step="0.01" value={variantForm.price_modifier} onChange={(e) => setVariantForm({ ...variantForm, price_modifier: e.target.value })} className="input-field" />
                <p className="text-xs text-gray-500 mt-1">Valor adicionado ao preço base do produto</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={variantForm.is_active} onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })} className="w-4 h-4 text-luluca-primary rounded" />
                <span className="text-sm">Variante ativa</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingVariant ? 'Salvar' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
