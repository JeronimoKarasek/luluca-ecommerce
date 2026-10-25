import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowLeftRight, Clock, PackageCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Troca | LULUCA',
  description: 'Conheça nossa política de troca e devolução. Garantimos sua satisfação com nossos produtos.',
}

export default function PoliticaTroca() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-luluca-cream">
        {/* Hero */}
        <div className="bg-luluca-dark text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ArrowLeftRight size={40} className="mx-auto mb-4 text-luluca-gold" />
            <h1 className="text-3xl md:text-4xl font-serif mb-3">Política de Troca e Devolução</h1>
            <p className="text-gray-300 text-lg">Sua satisfação é nossa prioridade</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Na <strong className="text-luluca-dark">LULUCA</strong>, queremos que você esteja completamente satisfeita(o)
              com sua compra. Por isso, facilitamos ao máximo o processo de troca e devolução.
              Leia atentamente nossa política abaixo para entender como funciona.
            </p>
          </div>

          {/* Prazo */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Prazo para Troca</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Você tem até <strong>7 dias corridos</strong> após o recebimento do produto para solicitar a troca.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Para produtos com defeito, o prazo é de <strong>90 dias</strong> conforme o Código de Defesa do Consumidor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>A primeira troca por tamanho é <strong>gratuita</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Condições */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <PackageCheck size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Condições para Troca</h2>
            </div>
            <p className="text-gray-700 mb-4">Para que a troca seja aceita, o produto deve atender às seguintes condições:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Aceitamos troca quando:
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Produto sem uso, lavagem ou alteração</li>
                  <li>• Com etiquetas originais intactas</li>
                  <li>• Na embalagem original</li>
                  <li>• Acompanhado da nota fiscal</li>
                  <li>• Produto com defeito de fabricação</li>
                  <li>• Produto diferente do pedido</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <XCircle size={16} /> Não aceitamos troca quando:
                </h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Produto já foi usado ou lavado</li>
                  <li>• Etiquetas foram removidas</li>
                  <li>• Produto apresenta sinais de uso</li>
                  <li>• Produtos íntimos (biquínis, lingeries)</li>
                  <li>• Produto em promoção (exceto defeito)</li>
                  <li>• Prazo de troca expirado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Como solicitar */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ArrowLeftRight size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Como Solicitar a Troca</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-luluca-primary text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Entre em contato</h3>
                  <p className="text-gray-600 text-sm">Envie um e-mail ou mensagem informando o número do pedido, o motivo da troca e se deseja outro tamanho, cor ou reembolso.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-luluca-primary text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Aguarde a confirmação</h3>
                  <p className="text-gray-600 text-sm">Nossa equipe analisará sua solicitação e enviará as instruções para envio do produto em até 2 dias úteis.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-luluca-primary text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Envie o produto</h3>
                  <p className="text-gray-600 text-sm">Embale o produto com cuidado e envie pelos Correios utilizando o código de postagem fornecido pela nossa equipe.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-luluca-primary text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Receba o novo produto ou reembolso</h3>
                  <p className="text-gray-600 text-sm">Após recebermos e analisarmos o produto devolvido, enviaremos o novo item ou realizaremos o reembolso em até 10 dias úteis.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reembolso */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Reembolso</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Cartão de crédito:</strong> O estorno será realizado na fatura seguinte ou em até 2 faturas, dependendo da operadora.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>PIX / Boleto:</strong> O reembolso será feito via PIX na conta informada em até 10 dias úteis após o recebimento do produto.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Vale-troca:</strong> Você pode optar por receber um vale-troca no valor da compra, válido por 6 meses.</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-luluca-dark text-white rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif mb-2">Ficou com alguma dúvida?</h3>
            <p className="text-gray-300 mb-4">Nossa equipe está pronta para ajudar você.</p>
            <Link href="/faq" className="inline-block bg-luluca-gold text-white px-6 py-2.5 rounded-lg font-medium hover:bg-luluca-gold/90 transition-colors">
              Ver Perguntas Frequentes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
