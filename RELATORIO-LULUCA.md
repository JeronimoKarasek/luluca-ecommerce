# RELATÓRIO — LULUCA (moda infantil)

**Live:** https://luluca.farolbase.com
**Repo:** https://github.com/JeronimoKarasek/luluca-ecommerce
**Base:** fork do sistema Scarlet (loja + admin completo), rebrand 100% Luluca.
**Supabase:** mesmo projeto do Scarlet (gpakoffbuypbmfiwewka), tabelas isoladas com sufixo `_luluca`.

## Identidade (da logo enviada)
- Paleta: dourado `#d4af37`/`#b8860b`, creme `#faf8f5`/`#f5f1e8`, azul-marinho `#1e2a44`
- Fontes: Playfair Display (títulos) + Nunito (corpo, arredondada infantil)
- Logo: fundo removido (PNG transparente) em `public/logo.png` + `logo-icon.png`
- Favicon: `src/app/icon.svg` (cabide dourado com coração)

## Banco (executado em produção)
10 tabelas `*_luluca` + bucket público `images-luluca` + RLS.
Categorias seed: Meninas, Meninos, Bebês, Sapatinhos, Acessórios.
20 subcategorias (Vestidos, Bodies & Macacõezinhos, Tênis, Laços & Tiaras etc.).
Settings seed: `shipping_free_above=199`, `social_instagram=lulucadesapegos`.
Admin auth: criar usuário em Supabase → Authentication → Users (login /admin).

## Copy de conversão (baseada no IG @lulucadesapegos)
- Hero: "Peças que a mamãe aprova e a criançada ama ❤️" + CTA "Comprar agora — peças de hoje"
- Urgência de peça única: "estoque pequeno e rotativo", marquee navy
- Seções: curadoria/consumo consciente, categorias, destaques, CTA navy, novidades
- Placeholders premium enquanto não há produtos cadastrados (sem cara de loja vazia)

## Páginas (todas 200 em produção)
`/` `/produtos` `/produto/[slug]` `/checkout` `/pedido/[num]` `/faq` `/termos`
`/politica-troca` (7 dias) `/politica-privacidade` `/admin` (login Supabase)

## Verificações reais
- Build Next 14: ✓ 23 rotas
- Home browser: 5 categorias do Supabase visíveis, CTA na 1ª dobra desktop 1366 e mobile 390
- /produtos: filtros das 5 categorias funcionando
- Nota visual (vision): 8,5/10 "pronto pra vender"

## Pendências (decisão sua)
1. Cadastrar produtos reais pelo /admin (fotos → bucket images-luluca)
2. Configurar PIX real e WhatsApp em /admin/configuracoes
3. Criar usuário admin no Supabase Auth
4. Troca: política ajustada para 7 dias (padrão desapego) — confirmar
