# LULUCA — Moda Infantil

E-commerce de moda infantil (peças novas e seminovas, curadoria desapego) com painel administrativo completo.

**Stack:** Next.js 14 (App Router) · Supabase · Tailwind CSS · Zustand

## Loja (frente de vendas)
- Home de alta conversão com hero, prova social, benefícios, categorias e vitrines
- Catálogo `/produtos` com filtros por categoria/subcategoria
- Página de produto com variantes (tamanho, cor) e estoque
- Checkout em etapas (dados → PIX → confirmação)
- Acompanhamento de pedido por número em `/pedido/[numero]`

## Admin (`/admin`)
Autenticação via Supabase Auth. Módulos:
- Dashboard (visão geral e vendas)
- Produtos, Categorias, Subcategorias, Estoque
- Pedidos, Clientes, Financeiro, Relatórios, Configurações

## Banco de dados (Supabase)
Tabelas isoladas com sufixo `_luluca` (não conflitam com nenhum outro sistema):
`categories_luluca`, `subcategories_luluca`, `products_luluca`, `product_images_luluca`, `product_variants_luluca`, `customers_luluca`, `orders_luluca`, `order_items_luluca`, `financial_transactions_luluca`, `store_settings_luluca`.

Rode no SQL Editor do Supabase:
1. `supabase-schema-luluca.sql`
2. (opcional) `supabase-migration-subcategorias-luluca.sql`

Storage: bucket público `images-luluca`.

## Variáveis de ambiente (`.env.local` ou Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Desenvolvimento
```bash
npm install
npm run dev
```

## Deploy
Vercel (importar o repo, framework Next.js, adicionar as env vars acima).
