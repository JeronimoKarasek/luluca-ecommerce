import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FileText, ShoppingBag, CreditCard, Truck, UserX, Scale, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso | LULUCA',
  description: 'Leia os termos e condições de uso da loja LULUCA.',
}

export default function TermosDeUso() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-luluca-cream">
        {/* Hero */}
        <div className="bg-luluca-dark text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <FileText size={40} className="mx-auto mb-4 text-luluca-gold" />
            <h1 className="text-3xl md:text-4xl font-serif mb-3">Termos de Uso</h1>
            <p className="text-gray-300 text-lg">Condições gerais para utilização da nossa loja de moda infantil (peças novas e seminovas)</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <p className="text-gray-700 leading-relaxed">
              Ao acessar e utilizar o site da <strong className="text-luluca-dark">LULUCA</strong>, você concorda com os 
              termos e condições descritos abaixo. Leia atentamente antes de realizar qualquer compra ou cadastro 
              em nossa plataforma. Caso não concorde com algum dos termos, solicitamos que não utilize nossos serviços.
            </p>
          </div>

          {/* Aceitação */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">1. Aceitação dos Termos</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Ao navegar, criar uma conta ou efetuar uma compra no site LULUCA, você declara ter lido, compreendido e aceito estes Termos de Uso integralmente.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Estes termos podem ser atualizados a qualquer momento, sem aviso prévio. A versão mais recente estará sempre disponível nesta página.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>O uso continuado do site após alterações constitui aceitação dos novos termos.</span>
              </li>
            </ul>
          </div>

          {/* Cadastro */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserX size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">2. Cadastro e Conta</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Para realizar compras, é necessário fornecer dados pessoais verdadeiros e atualizados durante o checkout.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Você é responsável por manter a veracidade das informações fornecidas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>O fornecimento de dados falsos pode resultar no cancelamento do pedido e bloqueio do cadastro.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Para realizar compras, o usuário deve ter pelo menos 18 anos ou estar devidamente representado por um responsável legal.</span>
              </li>
            </ul>
          </div>

          {/* Produtos e Preços */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">3. Produtos e Preços</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>As cores e detalhes dos produtos podem apresentar pequenas variações em relação às fotos, devido à calibração de monitores e telas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Os preços podem ser alterados sem aviso prévio. O preço válido é o exibido no momento da finalização da compra.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>A disponibilidade de estoque pode variar. Caso um produto fique indisponível após a compra, entraremos em contato para oferecer alternativas ou reembolso.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Promoções têm prazo de validade e podem ser encerradas a qualquer momento, sem aviso prévio.</span>
              </li>
            </ul>
          </div>

          {/* Pagamento */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">4. Pagamento</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Os pagamentos são processados por intermediadores financeiros seguros (como Mercado Pago e Asaas). A LULUCA não armazena dados de cartões de crédito.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Aceitamos pagamentos via PIX, cartão de crédito e boleto bancário, conforme as opções disponíveis no checkout.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>O pedido será confirmado somente após a confirmação do pagamento pelo intermediador financeiro.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Reservamo-nos o direito de cancelar pedidos com suspeita de fraude, após verificação.</span>
              </li>
            </ul>
          </div>

          {/* Entrega */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Truck size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">5. Entrega</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Os prazos de entrega são estimados e podem variar de acordo com a localidade e a transportadora.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>O prazo começa a contar a partir da confirmação do pagamento.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>É responsabilidade do cliente fornecer um endereço de entrega correto e completo. Entregas não realizadas por dados incorretos podem gerar custos adicionais.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>No ato do recebimento, confira a embalagem. Em caso de avarias, recuse o pacote e entre em contato conosco imediatamente.</span>
              </li>
            </ul>
          </div>

          {/* Propriedade Intelectual */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">6. Propriedade Intelectual</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Todo o conteúdo do site (textos, imagens, logotipos, design, layout) é de propriedade da LULUCA ou de seus licenciadores.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>É proibida a reprodução, distribuição ou modificação de qualquer conteúdo sem autorização prévia por escrito.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>A marca LULUCA, seu logotipo e identidade visual são protegidos por lei.</span>
              </li>
            </ul>
          </div>

          {/* Responsabilidades */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">7. Limitação de Responsabilidade</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>A LULUCA não se responsabiliza por danos indiretos resultantes do uso do site ou da impossibilidade de uso.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>Não garantimos que o site estará disponível de forma ininterrupta ou livre de erros. Manutenções podem ser realizadas sem aviso prévio.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span>A relação de consumo é regida pelo Código de Defesa do Consumidor (Lei nº 8.078/1990) e demais legislações aplicáveis.</span>
              </li>
            </ul>
          </div>

          {/* Foro */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">8. Foro</h2>
            </div>
            <p className="text-gray-700">
              Fica eleito o foro da comarca do domicílio do consumidor para dirimir quaisquer questões oriundas 
              destes Termos de Uso, conforme previsto no art. 101, I, do Código de Defesa do Consumidor.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-luluca-dark text-white rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif mb-2">Precisa de ajuda?</h3>
            <p className="text-gray-300 mb-4">Consulte também nossa política de troca e perguntas frequentes.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/politica-troca" className="inline-block bg-luluca-gold text-white px-6 py-2.5 rounded-lg font-medium hover:bg-luluca-gold/90 transition-colors">
                Política de Troca
              </Link>
              <Link href="/faq" className="inline-block bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/20 transition-colors">
                Perguntas Frequentes
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
