import { createServerSupabaseClient } from "@/lib/supabase"
import type { SurveyResponse, SurveyStatistics, DentistCount, SpecialtyCount } from "@/lib/supabase"
import { unstable_noStore as noStore } from "next/cache"

export async function fetchSurveyResponses(): Promise<SurveyResponse[]> {
  // Desabilitar cache para sempre buscar dados frescos
  noStore()

  try {
    console.log("Buscando respostas da pesquisa do Supabase...")

    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Credenciais do Supabase não estão definidas")
      return [] // Retornar array vazio em vez de lançar erro
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching survey responses:", error)
      return [] // Retornar array vazio em vez de lançar erro
    }

    console.log(`Encontradas ${data?.length || 0} respostas`)
    return data || []
  } catch (error) {
    console.error("Error in fetchSurveyResponses:", error)
    return [] // Retornar array vazio em vez de lançar erro
  }
}

export async function calculateStatistics(responses: SurveyResponse[]): Promise<SurveyStatistics> {
  if (!responses.length) {
    return {
      total_responses: 0,
      avg_reception_rating: 0,
      avg_punctuality_rating: 0,
      avg_clinical_rating: 0,
      integrative_interest_percentage: 0,
    }
  }

  const totalResponses = responses.length

  const avgReceptionRating = responses.reduce((sum, item) => sum + (item.reception_rating || 0), 0) / totalResponses

  const avgPunctualityRating = responses.reduce((sum, item) => sum + (item.punctuality_rating || 0), 0) / totalResponses

  const avgClinicalRating = responses.reduce((sum, item) => sum + (item.clinical_rating || 0), 0) / totalResponses

  const integrativeInterestCount = responses.filter((item) => item.integrative_interest).length

  const integrativeInterestPercentage = (integrativeInterestCount / totalResponses) * 100

  return {
    total_responses: totalResponses,
    avg_reception_rating: Number.parseFloat(avgReceptionRating.toFixed(1)),
    avg_punctuality_rating: Number.parseFloat(avgPunctualityRating.toFixed(1)),
    avg_clinical_rating: Number.parseFloat(avgClinicalRating.toFixed(1)),
    integrative_interest_percentage: Number.parseFloat(integrativeInterestPercentage.toFixed(1)),
  }
}

export async function calculateDentistCounts(responses: SurveyResponse[]): Promise<DentistCount[]> {
  if (!responses.length) return []

  // Agrupar por dentista
  const dentistGroups: Record<string, { count: number; ratings: number[] }> = {}

  responses.forEach((response) => {
    const dentist = response.selected_dentist || "Não especificado"

    if (!dentistGroups[dentist]) {
      dentistGroups[dentist] = { count: 1, ratings: [response.clinical_rating || 0] }
    } else {
      dentistGroups[dentist].count += 1
      dentistGroups[dentist].ratings.push(response.clinical_rating || 0)
    }
  })

  // Converter para o formato esperado
  return Object.entries(dentistGroups)
    .map(([selected_dentist, data]) => {
      const avgRating = data.ratings.reduce((sum, rating) => sum + rating, 0) / data.count

      return {
        selected_dentist,
        count: data.count,
        avg_rating: Number.parseFloat(avgRating.toFixed(1)),
      }
    })
    .sort((a, b) => b.count - a.count) // Ordenar por contagem (maior primeiro)
}

export async function calculateSpecialtyCounts(responses: SurveyResponse[]): Promise<SpecialtyCount[]> {
  if (!responses.length) return []

  const specialtyCounts: Record<string, number> = {}

  // Contar especialidades
  responses.forEach((response) => {
    if (response.specialties && Array.isArray(response.specialties)) {
      response.specialties.forEach((specialty) => {
        if (specialty) {
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1
        }
      })
    }

    if (response.other_specialty) {
      specialtyCounts[response.other_specialty] = (specialtyCounts[response.other_specialty] || 0) + 1
    }
  })

  // Converter para o formato esperado
  return Object.entries(specialtyCounts)
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((a, b) => b.count - a.count) // Ordenar por contagem (maior primeiro)
}

export async function fetchDashboardData() {
  try {
    console.log("Iniciando busca de dados para o dashboard...")

    // Buscar todas as respostas da pesquisa
    const surveyResponses = await fetchSurveyResponses()

    // Se não houver respostas, retornar dados vazios
    if (surveyResponses.length === 0) {
      console.log("Nenhuma resposta encontrada ou erro ao buscar dados")
      return {
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
    }

    // Calcular estatísticas
    const statistics = await calculateStatistics(surveyResponses)

    // Calcular contagens por dentista
    const dentistCounts = await calculateDentistCounts(surveyResponses)

    // Calcular contagens por especialidade
    const specialtyCounts = await calculateSpecialtyCounts(surveyResponses)

    console.log("Dados do dashboard processados com sucesso")

    return {
      surveyResponses,
      statistics,
      dentistCounts,
      specialtyCounts,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Retornar dados vazios em vez de lançar erro
    return {
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
  }
}
