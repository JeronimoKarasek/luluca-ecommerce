'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HelpCircle, ChevronDown, ChevronUp, ShoppingBag, Truck, CreditCard, ArrowLeftRight, Shield, Package } from 'lucide-react'
import Link from 'next/link'

type FAQItem = {
  question: string
  answer: string
}

type FAQCategory = {
  title: string
  icon: React.ReactNode
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    title: 'Pedidos e Compras',
    icon: <ShoppingBag size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'Como faço para realizar uma compra?',
        answer: 'Navegue pelo nosso catálogo, escolha os produtos desejados, selecione tamanho e cor, e adicione ao carrinho. Na finalização, preencha seus dados pessoais, endereço de entrega, escolha a forma de pagamento e confirme o pedido.',
      },
      {
        question: 'Preciso criar uma conta para comprar?',
        answer: 'Não é necessário criar uma conta previamente. Durante o checkout, seus dados são cadastrados automaticamente para que você possa acompanhar seu pedido.',
      },
      {
        question: 'Posso alterar ou cancelar meu pedido?',
        answer: 'Sim, mas apenas antes do envio. Entre em contato conosco o mais rápido possível informando o número do pedido. Após o despacho, não é possível cancelar, mas você poderá solicitar a troca ou devolução após o recebimento.',
      },
      {
        question: 'Como acompanho o status do meu pedido?',
        answer: 'Após a confirmação do pagamento, você receberá atualizações por e-mail sobre o status do seu pedido, incluindo o código de rastreamento quando disponível.',
      },
      {
        question: 'Os produtos possuem garantia?',
        answer: 'Sim. Todos os produtos possuem garantia contra defeitos de fabricação por 90 dias, conforme o Código de Defesa do Consumidor.',
      },
    ],
  },
  {
    title: 'Pagamento',
    icon: <CreditCard size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer: 'Aceitamos PIX (pagamento instantâneo), cartão de crédito e boleto bancário. As opções disponíveis são exibidas no checkout conforme a configuração da loja.',
      },
      {
        question: 'O pagamento via PIX é seguro?',
        answer: 'Sim! O PIX é um meio de pagamento regulamentado pelo Banco Central do Brasil. Ao finalizar a compra, você receberá um QR Code e uma chave PIX para copiar e colar. O pagamento é confirmado instantaneamente.',
      },
      {
        question: 'Em quantas vezes posso parcelar?',
        answer: 'As condições de parcelamento variam conforme o gateway de pagamento utilizado. Geralmente, oferecemos parcelamento em até 12x no cartão de crédito, sujeito a juros conforme a operadora.',
      },
      {
        question: 'Quando meu pagamento é confirmado?',
        answer: 'PIX: confirmação imediata. Cartão de crédito: em poucos minutos. Boleto bancário: até 3 dias úteis após o pagamento.',
      },
      {
        question: 'Meus dados de pagamento estão seguros?',
        answer: 'Sim. A LULUCA não armazena dados de cartão de crédito. Os pagamentos são processados por intermediadores financeiros seguros e certificados (Mercado Pago, Asaas), com criptografia de ponta a ponta.',
      },
    ],
  },
  {
    title: 'Entrega e Frete',
    icon: <Truck size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo de entrega varia conforme sua localidade. Em geral, de 3 a 15 dias úteis após a confirmação do pagamento. O prazo estimado é informado no checkout.',
      },
      {
        question: 'Vocês oferecem frete grátis?',
        answer: 'Sim! Oferecemos frete grátis para compras acima de um valor mínimo, que pode variar conforme promoções vigentes. O valor é exibido no topo do site e no checkout.',
      },
      {
        question: 'Entregam para todo o Brasil?',
        answer: 'Sim, realizamos entregas para todo o território nacional através dos Correios e transportadoras parceiras.',
      },
      {
        question: 'Como rastrear meu pedido?',
        answer: 'Após o envio, você receberá o código de rastreamento por e-mail. Utilize o código no site dos Correios ou da transportadora para acompanhar o status da entrega.',
      },
      {
        question: 'O que fazer se meu pedido não chegou dentro do prazo?',
        answer: 'Entre em contato conosco informando o número do pedido. Verificaremos junto à transportadora e resolveremos a situação o mais rápido possível.',
      },
    ],
  },
  {
    title: 'Trocas e Devoluções',
    icon: <ArrowLeftRight size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'Qual o prazo para solicitar troca?',
        answer: 'Você tem até 7 dias corridos após o recebimento para solicitar a troca. Para produtos com defeito, o prazo é de 90 dias.',
      },
      {
        question: 'A primeira troca é gratuita?',
        answer: 'Sim! A primeira troca por tamanho é totalmente gratuita. Nós cobrimos os custos de envio.',
      },
      {
        question: 'Como solicitar uma troca?',
        answer: 'Entre em contato conosco informando o número do pedido, o produto que deseja trocar e o motivo. Nossa equipe responderá em até 2 dias úteis com as instruções de envio.',
      },
      {
        question: 'Posso devolver e receber reembolso?',
        answer: 'Sim. Caso prefira não trocar, você pode solicitar o reembolso. O valor será devolvido na mesma forma de pagamento original ou via PIX, em até 10 dias úteis após recebermos o produto.',
      },
      {
        question: 'Quais produtos não podem ser trocados?',
        answer: 'Produtos íntimos (biquínis, lingeries), produtos usados, lavados, sem etiquetas ou fora do prazo de troca não são aceitos para devolução.',
      },
    ],
  },
  {
    title: 'Produtos',
    icon: <Package size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'As cores dos produtos são fiéis às fotos?',
        answer: 'Fazemos o possível para que as fotos representem fielmente os produtos. No entanto, pequenas variações de cor podem ocorrer devido à calibração do seu monitor ou tela do celular.',
      },
      {
        question: 'Como escolher o tamanho certo?',
        answer: 'Cada produto possui uma tabela de medidas na página de detalhes. Recomendamos que você tire suas medidas e compare com a tabela antes de finalizar a compra. Em caso de dúvida, entre em contato conosco.',
      },
      {
        question: 'Vocês têm tamanhos plus size?',
        answer: 'Trabalhamos com uma variedade de tamanhos e buscamos incluir cada vez mais opções. Consulte a disponibilidade de tamanhos em cada produto.',
      },
      {
        question: 'Os produtos estão sempre disponíveis?',
        answer: 'Trabalhamos com estoque limitado para manter a exclusividade de nossas peças. Caso um produto esgote, pode ser que não seja reposto. Fique atenta às novidades!',
      },
    ],
  },
  {
    title: 'Conta e Privacidade',
    icon: <Shield size={22} className="text-luluca-gold" />,
    items: [
      {
        question: 'Como solicitar a exclusão dos meus dados?',
        answer: 'Conforme a LGPD, você pode solicitar a exclusão dos seus dados pessoais a qualquer momento. Entre em contato conosco e processaremos sua solicitação em até 15 dias.',
      },
      {
        question: 'Como cancelar a newsletter?',
        answer: 'Todos os e-mails da newsletter possuem um link de descadastramento no rodapé. Basta clicar em "Descadastrar" para parar de receber nossos comunicados.',
      },
      {
        question: 'Vocês compartilham meus dados?',
        answer: 'Não vendemos nem compartilhamos seus dados para fins de marketing. Seus dados são compartilhados apenas com transportadoras (para entrega) e gateways de pagamento (para processar pagamentos). Consulte nossa Política de Privacidade para mais detalhes.',
      },
    ],
  },
]

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-luluca-light/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-luluca-cream/50 transition-colors text-left"
      >
        <span className="font-medium text-gray-800">{item.question}</span>
        {open ? (
          <ChevronUp size={20} className="text-luluca-primary flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 py-4 bg-white border-t border-luluca-light/10">
          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-luluca-cream">
        {/* Hero */}
        <div className="bg-luluca-dark text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <HelpCircle size={40} className="mx-auto mb-4 text-luluca-gold" />
            <h1 className="text-3xl md:text-4xl font-serif mb-3">Perguntas Frequentes</h1>
            <p className="text-gray-300 text-lg">Sobre peças novas, seminovas, envios e trocas</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {faqData.map((category, catIndex) => (
            <div key={catIndex} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                {category.icon}
                <h2 className="text-xl font-serif text-luluca-dark">{category.title}</h2>
              </div>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <FAQAccordion key={itemIndex} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="bg-luluca-dark text-white rounded-xl p-8 text-center mt-4">
            <h3 className="text-xl font-serif mb-2">Não encontrou sua resposta?</h3>
            <p className="text-gray-300 mb-4">
              Entre em contato conosco e teremos prazer em ajudar.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/politica-troca" className="inline-block bg-luluca-gold text-white px-6 py-2.5 rounded-lg font-medium hover:bg-luluca-gold/90 transition-colors">
                Política de Troca
              </Link>
              <Link href="/politica-privacidade" className="inline-block bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/20 transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="inline-block bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/20 transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
