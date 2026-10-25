-- =====================================================
-- LULUCA E-COMMERCE - MIGRAÇÃO: SUBCATEGORIAS
-- Execute este SQL no Supabase (SQL Editor)
-- ATENÇÃO: JAMAIS EXCLUA TABELAS
-- =====================================================

-- 1. Criar tabela de subcategorias
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

-- 2. Adicionar coluna subcategory_id na tabela de produtos (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_luluca' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products_luluca ADD COLUMN subcategory_id UUID REFERENCES subcategories_luluca(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_subcategories_luluca_category ON subcategories_luluca(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_luluca_slug ON subcategories_luluca(slug);
CREATE INDEX IF NOT EXISTS idx_products_luluca_subcategory ON products_luluca(subcategory_id);

-- 4. Trigger de updated_at para subcategorias
DROP TRIGGER IF EXISTS set_updated_at ON subcategories_luluca;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subcategories_luluca
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security)
ALTER TABLE subcategories_luluca ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DROP POLICY IF EXISTS "Leitura pública de subcategorias" ON subcategories_luluca;
CREATE POLICY "Leitura pública de subcategorias" ON subcategories_luluca FOR SELECT USING (true);

-- Admin gerencia subcategorias
DROP POLICY IF EXISTS "Admin gerencia subcategorias" ON subcategories_luluca;
CREATE POLICY "Admin gerencia subcategorias" ON subcategories_luluca FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
