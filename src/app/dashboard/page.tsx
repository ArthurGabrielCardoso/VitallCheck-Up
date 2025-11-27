import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipo para os dados da pesquisa
type SurveyResponse = {
  id: number
  submitted_at: string
  reception_rating: number
  punctuality_rating: number
  selected_dentist: string
  clinical_rating: number
  integrative_interest: "yes" | "no"
  specialties: string[] | null
  other_specialty: string | null
  comments: string | null
}

// Função para buscar dados simulados
async function fetchDashboardData(): Promise<SurveyResponse[]> {
  // Simulando um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Dados simulados
  return [
    {
      id: 1,
      submitted_at: "2023-10-27T10:00:00Z",
      reception_rating: 5,
      punctuality_rating: 4,
      selected_dentist: "Dra. Ana",
      clinical_rating: 5,
      integrative_interest: "yes",
      specialties: ["Nutricionista", "Fisioterapeuta"],
      other_specialty: null,
      comments: "Ótimo atendimento! A Dra. Ana foi muito atenciosa e explicou todo o procedimento detalhadamente.",
    },
    {
      id: 2,
      submitted_at: "2023-10-27T11:30:00Z",
      reception_rating: 4,
      punctuality_rating: 5,
      selected_dentist: "Dr. Pedro",
      clinical_rating: 4,
      integrative_interest: "no",
      specialties: null,
      other_specialty: null,
      comments: null,
    },
    {
      id: 3,
      submitted_at: "2023-10-28T09:15:00Z",
      reception_rating: 3,
      punctuality_rating: 3,
      selected_dentist: "Dra. Marcela",
      clinical_rating: 5,
      integrative_interest: "yes",
      specialties: ["Psicólogo(a)", "Médico(a)"],
      other_specialty: null,
      comments: "Excelente atendimento clínico, mas tive que esperar um pouco além do horário marcado.",
    },
    {
      id: 4,
      submitted_at: "2023-10-28T14:45:00Z",
      reception_rating: 5,
      punctuality_rating: 5,
      selected_dentist: "Dra. Juliana",
      clinical_rating: 5,
      integrative_interest: "yes",
      specialties: ["Nutricionista", "Terapeuta Holístico / Alternativo"],
      other_specialty: "Acupunturista",
      comments: "Adoraria ter acesso a serviços de acupuntura junto com o tratamento odontológico!",
    },
    {
      id: 5,
      submitted_at: "2023-10-29T10:30:00Z",
      reception_rating: 4,
      punctuality_rating: 4,
      selected_dentist: "Dr. Pedro",
      clinical_rating: 4,
      integrative_interest: "yes",
      specialties: ["Fisioterapeuta"],
      other_specialty: null,
      comments: null,
    },
    {
      id: 6,
      submitted_at: "2023-10-29T16:00:00Z",
      reception_rating: 5,
      punctuality_rating: 3,
      selected_dentist: "Dra. Ana",
      clinical_rating: 5,
      integrative_interest: "no",
      specialties: null,
      other_specialty: null,
      comments: "Atendimento excelente, mas a clínica estava um pouco atrasada no dia.",
    },
    {
      id: 7,
      submitted_at: "2023-10-30T11:15:00Z",
      reception_rating: 4,
      punctuality_rating: 4,
      selected_dentist: "Dra. Marcela",
      clinical_rating: 3,
      integrative_interest: "yes",
      specialties: ["Médico(a)", "Psicólogo(a)"],
      other_specialty: null,
      comments: "Gostaria de ter recebido mais informações sobre o tratamento.",
    },
  ]
}

export default async function SurveyDashboard() {
  // Buscar dados simulados
  const surveyData = await fetchDashboardData()

  // Calcular métricas
  const totalResponses = surveyData.length

  const avgReceptionRating = surveyData.reduce((sum, item) => sum + item.reception_rating, 0) / totalResponses
  const avgPunctualityRating = surveyData.reduce((sum, item) => sum + item.punctuality_rating, 0) / totalResponses
  const avgClinicalRating = surveyData.reduce((sum, item) => sum + item.clinical_rating, 0) / totalResponses

  const integrativeInterestYes = surveyData.filter((item) => item.integrative_interest === "yes").length
  const integrativeInterestPercentage = (integrativeInterestYes / totalResponses) * 100

  // Contagem por dentista
  const dentistCounts: Record<string, number> = {}
  surveyData.forEach((item) => {
    dentistCounts[item.selected_dentist] = (dentistCounts[item.selected_dentist] || 0) + 1
  })

  // Contagem de especialidades
  const specialtyCounts: Record<string, number> = {}
  surveyData.forEach((item) => {
    if (item.specialties) {
      item.specialties.forEach((specialty) => {
        specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1
      })
    }
    if (item.other_specialty) {
      specialtyCounts[item.other_specialty] = (specialtyCounts[item.other_specialty] || 0) + 1
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard - Pesquisa de Satisfação Vitall Check-up</h1>
        <p className="text-gray-600 mt-2">
          Visualize e analise os resultados das pesquisas de satisfação dos pacientes.
        </p>
      </header>

      {/* Seção de Resumo (Cards) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Total de Respostas */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Total de Respostas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalResponses}</p>
          </div>

          {/* Card: Média Recepção */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Recepção</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgReceptionRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Média Pontualidade */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Pontualidade</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgPunctualityRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Média Atendimento Clínico */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Média de Avaliação - Atendimento Clínico</h3>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-800">{avgClinicalRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">★</span>
            </div>
          </div>

          {/* Card: Interesse em Saúde Integrativa */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Interesse em Saúde Integrativa</h3>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-800">{integrativeInterestPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-600 mt-1">Responderam "Sim"</p>
            </div>
          </div>

          {/* Card: Distribuição por Dentista */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary">
            <h3 className="text-gray-500 text-sm font-medium">Distribuição por Dentista</h3>
            <div className="mt-2 space-y-1">
              {Object.entries(dentistCounts).map(([dentist, count]) => (
                <div key={dentist} className="flex justify-between">
                  <span className="text-gray-600">{dentist}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Gráficos (Placeholders) */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Gráficos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placeholder para gráfico de barras */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-700 font-medium mb-4">Média de Avaliação Clínica por Dentista</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-gray-500 mb-2">Gráfico de Barras</p>
                <p className="text-sm text-gray-400">
                  Implementar com Recharts ou Chart.js:
                  <br />
                  <code>{"<BarChart data={dentistRatingData} />"}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder para gráfico de pizza */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-700 font-medium mb-4">Especialidades de Saúde Integrativa Mais Solicitadas</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-gray-500 mb-2">Gráfico de Pizza</p>
                <p className="text-sm text-gray-400">
                  Implementar com Recharts ou Chart.js:
                  <br />
                  <code>{"<PieChart data={specialtyDistributionData} />"}</code>
                </p>
                <div className="mt-4 text-left">
                  {Object.entries(specialtyCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([specialty, count]) => (
                      <div key={specialty} className="flex justify-between text-sm">
                        <span className="text-gray-600">{specialty}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Respostas Detalhadas (Tabela) */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Respostas Detalhadas</h2>
          <p className="text-sm text-gray-500">Total: {totalResponses} respostas</p>
        </div>

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
                    Especialidades
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
                {surveyData.map((response) => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.submitted_at).toLocaleDateString("pt-BR")}
                      <div className="text-xs text-gray-400">
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
                          response.integrative_interest === "yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {response.integrative_interest === "yes" ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {response.specialties ? (
                        <ul className="list-disc list-inside">
                          {response.specialties.map((specialty, index) => (
                            <li key={index} className="text-xs">
                              {specialty}
                            </li>
                          ))}
                          {response.other_specialty && <li className="text-xs">Outro: {response.other_specialty}</li>}
                        </ul>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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

        <div className="mt-4 text-sm text-gray-500">
          <p>
            <strong>Nota:</strong> Os comentários abertos dos pacientes podem conter informações sensíveis. Considere
            implementar uma política de revisão antes de compartilhar amplamente.
          </p>
        </div>
      </section>
    </div>
  )
}
