import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExportDataButton } from "./components/export-data-button"
import { PrintButton } from "./components/print-button"
import { ChartsDashboardWrapper } from "./components/charts-dashboard-wrapper"
import { fetchDashboardData } from "./services/dashboard-service"
import { BulkDeleteButton } from "./components/bulk-delete-button"

export default async function SurveyDashboard() {
  let dashboardData = {
    surveyResponses: [],
    statistics: {
      total_responses: 0,
      avg_reception_rating: 0,
      avg_punctuality_rating: 0,
      avg_clinical_rating: 0,
      integrative_interest_percentage: 0,
    },
    dentistCounts: [],
    specialtyCounts: [],
  }

  try {
    // Buscar dados reais do Supabase
    dashboardData = await fetchDashboardData()
  } catch (error) {
    console.error("Error in SurveyDashboard:", error)
    // Continuar com dados vazios
  }

  // Extrair valores das estatísticas
  const totalResponses = dashboardData.statistics.total_responses
  const avgReceptionRating = dashboardData.statistics.avg_reception_rating
  const avgPunctualityRating = dashboardData.statistics.avg_punctuality_rating
  const avgClinicalRating = dashboardData.statistics.avg_clinical_rating
  const integrativeInterestPercentage = dashboardData.statistics.integrative_interest_percentage

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:bg-white">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard - Pesquisa de Satisfação Vitall Check-up</h1>
          <p className="text-gray-600 mt-2">
            Visualize e analise os resultados das pesquisas de satisfação dos pacientes.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <ExportDataButton />
          <PrintButton />
          <Link href="/dashboard/manage">
            <Button className="bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto print:hidden">
              Gerenciar Respostas
            </Button>
          </Link>
          <Link href="/dashboard/anamnese">
            <Button className="bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto print:hidden ml-2">
              Ver Anamneses
            </Button>
          </Link>
          <BulkDeleteButton />
        </div>
      </header>

      {/* Mensagem de aviso se não houver dados */}
      {dashboardData.surveyResponses.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 print:hidden">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Não foi possível carregar os dados do Supabase. Verifique a conexão e as credenciais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Resumo (Cards) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Total de Respostas */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Total de Respostas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalResponses}</p>
          </div>

          {/* Card: Média Recepção */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Recepção</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgReceptionRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Média Pontualidade */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Pontualidade</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgPunctualityRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Média Atendimento Clínico */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Atendimento Clínico</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgClinicalRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Interesse em Saúde Integrativa */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Interesse em Saúde Integrativa</h3>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-800">{integrativeInterestPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-600 mt-1">Responderam "Sim"</p>
            </div>
          </div>

          {/* Card: Distribuição por Dentista */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary print:break-inside-avoid">
            <h3 className="text-gray-500 text-sm font-medium">Distribuição por Dentista</h3>
            <div className="mt-2 space-y-1">
              {dashboardData.dentistCounts.slice(0, 5).map((item) => (
                <div key={item.selected_dentist} className="flex justify-between">
                  <span className="text-gray-600">{item.selected_dentist}:</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
              {dashboardData.dentistCounts.length === 0 && <div className="text-gray-500">Nenhum dado disponível</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Gráficos */}
      <section className="mb-10 print:break-before-page">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Gráficos</h2>
        <ChartsDashboardWrapper
          surveyResponses={dashboardData.surveyResponses}
          statistics={dashboardData.statistics}
          dentistCounts={dashboardData.dentistCounts}
          specialtyCounts={dashboardData.specialtyCounts}
        />
      </section>

      {/* Seção de Respostas Recentes */}
      <section className="print:break-before-page">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Respostas Recentes</h2>
          <Link href="/dashboard/manage" className="print:hidden">
            <Button variant="outline" size="sm">
              Ver todas as respostas
            </Button>
          </Link>
        </div>

        {dashboardData.surveyResponses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Nenhuma resposta encontrada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data Envio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Recepção
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pontualidade
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dentista
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Clínico
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Interesse Integrativa
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Comentários
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.surveyResponses.slice(0, 10).map((response) => (
                    <tr key={response.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(response.submitted_at).toLocaleDateString("pt-BR")}
                        <div className="text-xs text-gray-400 print:hidden">
                          {formatDistanceToNow(new Date(response.submitted_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{response.reception_rating}</span>
                          <span className="text-yellow-500 ml-1">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{response.punctuality_rating}</span>
                          <span className="text-yellow-500 ml-1">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{response.selected_dentist}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{response.clinical_rating}</span>
                          <span className="text-yellow-500 ml-1">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            response.integrative_interest ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {response.integrative_interest ? "Sim" : "Não"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {response.comments || <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Rodapé para impressão */}
      <footer className="mt-8 text-center text-sm text-gray-500 hidden print:block">
        <p>
          Relatório gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
        </p>
        <p>Vitall Check-up - Pesquisa de Satisfação</p>
      </footer>
    </div>
  )
}
