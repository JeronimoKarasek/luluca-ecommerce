import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Shield, Eye, Lock, Database, UserCheck, Globe, Bell, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade | LULUCA',
  description: 'Saiba como a LULUCA coleta, utiliza e protege seus dados pessoais.',
}

export default function PoliticaPrivacidade() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-luluca-cream">
        {/* Hero */}
        <div className="bg-luluca-dark text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Shield size={40} className="mx-auto mb-4 text-luluca-gold" />
            <h1 className="text-3xl md:text-4xl font-serif mb-3">Política de Privacidade</h1>
            <p className="text-gray-300 text-lg">Transparência e segurança com seus dados</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <p className="text-gray-700 leading-relaxed">
              A <strong className="text-luluca-dark">LULUCA</strong> está comprometida em proteger a privacidade 
              de seus clientes e visitantes. Esta Política de Privacidade descreve como coletamos, usamos, 
              armazenamos e protegemos suas informações pessoais, em conformidade com a 
              <strong> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
            </p>
          </div>

          {/* Dados Coletados */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Dados que Coletamos</h2>
            </div>
            <p className="text-gray-700 mb-4">Podemos coletar as seguintes informações pessoais:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-luluca-cream rounded-lg p-4">
                <h3 className="font-semibold text-luluca-dark mb-2">Dados de Cadastro</h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Nome completo</li>
                  <li>• E-mail</li>
                  <li>• CPF</li>
                  <li>• Telefone</li>
                  <li>• Data de nascimento</li>
                </ul>
              </div>
              <div className="bg-luluca-cream rounded-lg p-4">
                <h3 className="font-semibold text-luluca-dark mb-2">Dados de Compra</h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Endereço de entrega</li>
                  <li>• Histórico de pedidos</li>
                  <li>• Dados de pagamento (processados por terceiros)</li>
                  <li>• Preferências de produtos</li>
                  <li>• Dados de navegação (cookies)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Como Usamos */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Como Utilizamos seus Dados</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Processar pedidos:</strong> Para realizar a entrega dos produtos e emitir notas fiscais.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Comunicação:</strong> Para enviar confirmações de pedido, atualizações de entrega e responder suas dúvidas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Marketing:</strong> Para enviar ofertas e novidades, caso você tenha dado consentimento (newsletter).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Melhorar a experiência:</strong> Para personalizar o conteúdo do site e melhorar nossos serviços.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Obrigações legais:</strong> Para cumprir obrigações fiscais, contábeis e regulatórias.</span>
              </li>
            </ul>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Segurança dos Dados</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-luluca-cream rounded-lg">
                <Lock size={28} className="mx-auto mb-2 text-luluca-dark" />
                <h3 className="font-semibold text-sm text-luluca-dark mb-1">Criptografia SSL</h3>
                <p className="text-xs text-gray-600">Todas as transmissões de dados são criptografadas</p>
              </div>
              <div className="text-center p-4 bg-luluca-cream rounded-lg">
                <Shield size={28} className="mx-auto mb-2 text-luluca-dark" />
                <h3 className="font-semibold text-sm text-luluca-dark mb-1">Acesso Restrito</h3>
                <p className="text-xs text-gray-600">Somente pessoal autorizado tem acesso aos dados</p>
              </div>
              <div className="text-center p-4 bg-luluca-cream rounded-lg">
                <Database size={28} className="mx-auto mb-2 text-luluca-dark" />
                <h3 className="font-semibold text-sm text-luluca-dark mb-1">Servidores Seguros</h3>
                <p className="text-xs text-gray-600">Dados armazenados em servidores com proteção avançada</p>
              </div>
            </div>
          </div>

          {/* Compartilhamento */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Compartilhamento de Dados</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Transportadoras:</strong> Para realizar a entrega dos produtos (nome, endereço e telefone).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Gateways de pagamento:</strong> Para processar pagamentos de forma segura (Mercado Pago, Asaas, etc.).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Autoridades legais:</strong> Quando exigido por lei, ordem judicial ou processo legal.</span>
              </li>
            </ul>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm font-medium">
                ✓ Nunca vendemos, alugamos ou comercializamos seus dados pessoais a terceiros para fins de marketing.
              </p>
            </div>
          </div>

          {/* Direitos do Titular */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Seus Direitos (LGPD)</h2>
            </div>
            <p className="text-gray-700 mb-4">
              De acordo com a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: 'Acesso', desc: 'Solicitar cópia dos dados pessoais que possuímos sobre você' },
                { title: 'Correção', desc: 'Solicitar a correção de dados incompletos ou incorretos' },
                { title: 'Exclusão', desc: 'Solicitar a exclusão de dados desnecessários ou excessivos' },
                { title: 'Portabilidade', desc: 'Solicitar a transferência de seus dados para outro fornecedor' },
                { title: 'Revogação', desc: 'Revogar o consentimento para o uso de seus dados a qualquer momento' },
                { title: 'Informação', desc: 'Ser informado sobre com quem os dados são compartilhados' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-luluca-cream rounded-lg p-3">
                  <div className="w-6 h-6 bg-luluca-gold text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <div>
                    <h3 className="font-semibold text-luluca-dark text-sm">{item.title}</h3>
                    <p className="text-gray-600 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Cookies</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para melhorar sua experiência de navegação. Os cookies podem ser:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Essenciais:</strong> Necessários para o funcionamento do site (carrinho de compras, login).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Analíticos:</strong> Para entender como os visitantes navegam no site e melhorar a experiência.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-luluca-gold rounded-full mt-2 flex-shrink-0" />
                <span><strong>Marketing:</strong> Para exibir anúncios relevantes em outras plataformas.</span>
              </li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Você pode desativar os cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade do site.
            </p>
          </div>

          {/* Alterações */}
          <div className="bg-white rounded-xl shadow-sm border border-luluca-light/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-luluca-gold" />
              <h2 className="text-xl font-serif text-luluca-dark">Alterações nesta Política</h2>
            </div>
            <p className="text-gray-700">
              Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que você revise esta 
              página regularmente para se manter informado sobre como protegemos seus dados. A data da última 
              atualização será sempre exibida no final desta página.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-luluca-dark text-white rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif mb-2">Dúvidas sobre seus dados?</h3>
            <p className="text-gray-300 mb-4">
              Entre em contato conosco para exercer seus direitos ou tirar dúvidas sobre esta política.
            </p>
            <Link href="/faq" className="inline-block bg-luluca-gold text-white px-6 py-2.5 rounded-lg font-medium hover:bg-luluca-gold/90 transition-colors">
              Ver Perguntas Frequentes
            </Link>
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
