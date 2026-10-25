export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type SubCategory = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  category_id: string | null
  subcategory_id: string | null
  is_active: boolean
  is_featured: boolean
  weight: number | null
  created_at: string
  updated_at: string
  category?: Category
  subcategory?: SubCategory
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  size: string | null
  color: string | null
  stock_quantity: number
  sku: string | null
  price_modifier: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  order_number: string
  customer_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  payment_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_info: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export type FinancialTransaction = {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  order_id: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type StoreSettings = {
  id: string
  store_name: string
  store_description: string | null
  store_email: string | null
  store_phone: string | null
  store_address: string | null
  logo_url: string | null
  favicon_url: string | null
  mercadopago_access_token: string | null
  mercadopago_public_key: string | null
  mercadopago_enabled: boolean
  asaas_api_key: string | null
  asaas_enabled: boolean
  shipping_free_above: number | null
  shipping_default_cost: number | null
  instagram_url: string | null
  facebook_url: string | null
  whatsapp_number: string | null
  created_at: string
  updated_at: string
}

export type CartItem = {
  product: Product
  variant?: ProductVariant
  quantity: number
  image?: string
}

export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueByMonth: { month: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  recentOrders: Order[]
}
