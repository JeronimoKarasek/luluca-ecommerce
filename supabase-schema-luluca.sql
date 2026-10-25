-- =====================================================
-- LULUCA E-COMMERCE - SCHEMA SUPABASE
-- Execute este SQL no Supabase (SQL Editor)
-- ATENÇÃO: JAMAIS EXCLUA TABELAS
-- =====================================================

-- ================== CATEGORIAS ==================
CREATE TABLE IF NOT EXISTS categories_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== SUBCATEGORIAS ==================
CREATE TABLE IF NOT EXISTS subcategories_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories_luluca(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- ================== PRODUTOS ==================
CREATE TABLE IF NOT EXISTS products_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  category_id UUID REFERENCES categories_luluca(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories_luluca(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight DECIMAL(10,3),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== IMAGENS DO PRODUTO ==================
CREATE TABLE IF NOT EXISTS product_images_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products_luluca(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================== VARIANTES DO PRODUTO ==================
CREATE TABLE IF NOT EXISTS product_variants_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products_luluca(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100),
  price_modifier DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== CLIENTES ==================
CREATE TABLE IF NOT EXISTS customers_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(9),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== PEDIDOS ==================
CREATE TABLE IF NOT EXISTS orders_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers_luluca(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(2),
  shipping_zip VARCHAR(9),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== ITENS DO PEDIDO ==================
CREATE TABLE IF NOT EXISTS order_items_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders_luluca(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products_luluca(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants_luluca(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_info VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================== TRANSAÇÕES FINANCEIRAS ==================
CREATE TABLE IF NOT EXISTS financial_transactions_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_id UUID REFERENCES orders_luluca(id) ON DELETE SET NULL,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== CONFIGURAÇÕES DA LOJA ==================
CREATE TABLE IF NOT EXISTS store_settings_luluca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================== ÍNDICES ==================
CREATE INDEX IF NOT EXISTS idx_products_luluca_category ON products_luluca(category_id);
CREATE INDEX IF NOT EXISTS idx_products_luluca_subcategory ON products_luluca(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_luluca_slug ON products_luluca(slug);
CREATE INDEX IF NOT EXISTS idx_products_luluca_active ON products_luluca(is_active);
CREATE INDEX IF NOT EXISTS idx_products_luluca_featured ON products_luluca(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_luluca_product ON product_images_luluca(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_luluca_product ON product_variants_luluca(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_luluca_customer ON orders_luluca(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_luluca_status ON orders_luluca(status);
CREATE INDEX IF NOT EXISTS idx_orders_luluca_number ON orders_luluca(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_luluca_order ON order_items_luluca(order_id);
CREATE INDEX IF NOT EXISTS idx_financial_luluca_type ON financial_transactions_luluca(type);
CREATE INDEX IF NOT EXISTS idx_financial_luluca_date ON financial_transactions_luluca(date);
CREATE INDEX IF NOT EXISTS idx_customers_luluca_email ON customers_luluca(email);
CREATE INDEX IF NOT EXISTS idx_categories_luluca_slug ON categories_luluca(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_luluca_category ON subcategories_luluca(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_luluca_slug ON subcategories_luluca(slug);
CREATE INDEX IF NOT EXISTS idx_store_settings_luluca_key ON store_settings_luluca(key);

-- ================== TRIGGER: UPDATED_AT AUTOMÁTICO ==================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['categories_luluca','products_luluca','product_variants_luluca','customers_luluca','orders_luluca','financial_transactions_luluca','store_settings_luluca','subcategories_luluca'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END;
$$;

-- ================== RLS (Row Level Security) ==================
-- Habilitar RLS em todas as tabelas
ALTER TABLE categories_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions_luluca ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings_luluca ENABLE ROW LEVEL SECURITY;

-- Policies: Leitura pública para loja
DROP POLICY IF EXISTS "Leitura pública de categorias" ON categories_luluca;
CREATE POLICY "Leitura pública de categorias" ON categories_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Leitura pública de subcategorias" ON subcategories_luluca;
CREATE POLICY "Leitura pública de subcategorias" ON subcategories_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Leitura pública de produtos" ON products_luluca;
CREATE POLICY "Leitura pública de produtos" ON products_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Leitura pública de imagens" ON product_images_luluca;
CREATE POLICY "Leitura pública de imagens" ON product_images_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Leitura pública de variantes" ON product_variants_luluca;
CREATE POLICY "Leitura pública de variantes" ON product_variants_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Leitura pública de configurações" ON store_settings_luluca;
CREATE POLICY "Leitura pública de configurações" ON store_settings_luluca FOR SELECT USING (true);

-- Policies: Escrita apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Admin gerencia categorias" ON categories_luluca;
CREATE POLICY "Admin gerencia categorias" ON categories_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia subcategorias" ON subcategories_luluca;
CREATE POLICY "Admin gerencia subcategorias" ON subcategories_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia produtos" ON products_luluca;
CREATE POLICY "Admin gerencia produtos" ON products_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia imagens" ON product_images_luluca;
CREATE POLICY "Admin gerencia imagens" ON product_images_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia variantes" ON product_variants_luluca;
CREATE POLICY "Admin gerencia variantes" ON product_variants_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia configurações" ON store_settings_luluca;
CREATE POLICY "Admin gerencia configurações" ON store_settings_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin gerencia financeiro" ON financial_transactions_luluca;
CREATE POLICY "Admin gerencia financeiro" ON financial_transactions_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies: Clientes, Pedidos e Itens - leitura/escrita para anon (checkout) e admin
DROP POLICY IF EXISTS "Inserir clientes checkout" ON customers_luluca;
CREATE POLICY "Inserir clientes checkout" ON customers_luluca FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin lê clientes" ON customers_luluca;
CREATE POLICY "Admin lê clientes" ON customers_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin atualiza clientes" ON customers_luluca;
CREATE POLICY "Admin atualiza clientes" ON customers_luluca FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Inserir pedidos checkout" ON orders_luluca;
CREATE POLICY "Inserir pedidos checkout" ON orders_luluca FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Ler pedidos" ON orders_luluca;
CREATE POLICY "Ler pedidos" ON orders_luluca FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin atualiza pedidos" ON orders_luluca;
CREATE POLICY "Admin atualiza pedidos" ON orders_luluca FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Inserir itens pedido" ON order_items_luluca;
CREATE POLICY "Inserir itens pedido" ON order_items_luluca FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Ler itens pedido" ON order_items_luluca;
CREATE POLICY "Ler itens pedido" ON order_items_luluca FOR SELECT USING (true);

-- Policy: Permitir update de stock por anon (checkout atualiza estoque)
DROP POLICY IF EXISTS "Update variantes checkout" ON product_variants_luluca;
CREATE POLICY "Update variantes checkout" ON product_variants_luluca FOR UPDATE USING (true) WITH CHECK (true);

-- ================== DADOS INICIAIS: CATEGORIAS ==================
INSERT INTO categories_luluca (name, slug, description, image_url, is_active, sort_order) VALUES
  ('Meninas', 'meninas', 'Vestidos, conjuntos e peças fofas para meninas', null, true, 1),
  ('Meninos', 'meninos', 'Moda confortável e estilosa para meninos', null, true, 2),
  ('Bebês', 'bebes', 'Pecinhas macias para o enxoval do bebê', null, true, 3),
  ('Sapatinhos', 'sapatinhos', 'Sapatinhos macios e confortáveis', null, true, 4),
  ('Acessórios', 'acessorios', 'Laços, tiaras, bonés e acessórios encantadores', null, true, 5)
ON CONFLICT (slug) DO NOTHING;

-- ================== CRIAR ADMIN ==================
-- Para criar o usuário admin, vá em:
-- Supabase Dashboard > Authentication > Users > Add User
-- E-mail: seu-email@exemplo.com  |  Senha: sua-senha-segura
-- Este será o login para acessar /admin

-- ================== STORAGE: BUCKET DE IMAGENS ==================
-- Execute no SQL Editor do Supabase ou crie manualmente:
-- Supabase Dashboard > Storage > New Bucket > Nome: images-luluca > Public: ON

-- Criar bucket via SQL (requer permissão de service_role):
INSERT INTO storage.buckets (id, name, public)
VALUES ('images-luluca', 'images-luluca', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao Storage
-- Leitura pública (qualquer um pode ver as imagens)
DROP POLICY IF EXISTS "Imagens públicas leitura" ON storage.objects;
CREATE POLICY "Imagens públicas leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'images-luluca');

-- Upload apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Upload imagens autenticados" ON storage.objects;
CREATE POLICY "Upload imagens autenticados" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images-luluca' AND auth.role() = 'authenticated');

-- Update apenas para usuários autenticados
DROP POLICY IF EXISTS "Update imagens autenticados" ON storage.objects;
CREATE POLICY "Update imagens autenticados" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images-luluca' AND auth.role() = 'authenticated');

-- Delete apenas para usuários autenticados
DROP POLICY IF EXISTS "Delete imagens autenticados" ON storage.objects;
CREATE POLICY "Delete imagens autenticados" ON storage.objects
  FOR DELETE USING (bucket_id = 'images-luluca' AND auth.role() = 'authenticated');
