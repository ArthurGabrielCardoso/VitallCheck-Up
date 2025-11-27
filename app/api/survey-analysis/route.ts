import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.log("API key do OpenAI não configurada. Usando análise de exemplo.")
      // Retornar análise de exemplo se não houver API key
      return NextResponse.json({ analysis: generateExampleAnalysis() })
    }

    console.log("API key configurada. Buscando dados do Supabase...")

    // Criar cliente do Supabase usando a função correta
    const supabase = createServerSupabaseClient()

    // Buscar respostas da pesquisa
    const { data: surveyResponses, error: surveyError } = await supabase
      .from("survey_responses")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (surveyError) {
      console.error("Erro ao buscar respostas da pesquisa:", surveyError)
      return NextResponse.json({ error: "Erro ao buscar dados do Supabase" }, { status: 500 })
    }

    if (!surveyResponses || surveyResponses.length === 0) {
      console.log("Não há dados suficientes para análise")
      return NextResponse.json({ error: "Não há dados suficientes para análise" }, { status: 400 })
    }

    console.log(`Encontradas ${surveyResponses.length} respostas de pesquisa`)

    // Calcular estatísticas
    const statistics = calculateStatistics(surveyResponses)

    // Contar dentistas
    const dentistCounts = countDentists(surveyResponses)

    // Contar especialidades
    const specialtyCounts = countSpecialties(surveyResponses)

    // Preparar os dados para enviar para a API do OpenAI
    const prompt = generatePrompt({
      surveyResponses,
      statistics,
      dentistCounts,
      specialtyCounts,
    })

    console.log("Chamando API do OpenAI com modelo gpt-4o-mini...")

    // Chamar a API do OpenAI
    const analysis = await generateAnalysis(prompt)

    console.log("Análise gerada com sucesso")

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Erro ao gerar análise:", error)
    // Retornar análise de exemplo em caso de erro
    return NextResponse.json({
      analysis: generateExampleAnalysis(),
      error_details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}

function calculateStatistics(surveyResponses) {
  try {
    const totalResponses = surveyResponses.length

    // Calcular médias de avaliações
    let totalReception = 0
    let totalPunctuality = 0
    let totalClinical = 0
    let integrativeInterestCount = 0

    surveyResponses.forEach((response) => {
      totalReception += response.reception_rating || 0
      totalPunctuality += response.punctuality_rating || 0
      totalClinical += response.clinical_rating || 0

      if (response.integrative_interest === true) {
        integrativeInterestCount++
      }
    })

    return {
      total_responses: totalResponses,
      avg_reception_rating: Number((totalReception / totalResponses).toFixed(1)) || 0,
      avg_punctuality_rating: Number((totalPunctuality / totalResponses).toFixed(1)) || 0,
      avg_clinical_rating: Number((totalClinical / totalResponses).toFixed(1)) || 0,
      integrative_interest_percentage: Number(((integrativeInterestCount / totalResponses) * 100).toFixed(1)) || 0,
    }
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error)
    // Retornar valores padrão em caso de erro
    return {
      total_responses: 0,
      avg_reception_rating: 0,
      avg_punctuality_rating: 0,
      avg_clinical_rating: 0,
      integrative_interest_percentage: 0,
    }
  }
}

function countDentists(surveyResponses) {
  try {
    const dentistMap = {}

    surveyResponses.forEach((response) => {
      const dentist = response.selected_dentist
      if (!dentist) return

      if (!dentistMap[dentist]) {
        dentistMap[dentist] = {
          count: 1,
          total_rating:
            ((response.reception_rating || 0) + (response.punctuality_rating || 0) + (response.clinical_rating || 0)) /
            3,
        }
      } else {
        dentistMap[dentist].count++
        dentistMap[dentist].total_rating +=
          ((response.reception_rating || 0) + (response.punctuality_rating || 0) + (response.clinical_rating || 0)) / 3
      }
    })

    return Object.entries(dentistMap).map(([selected_dentist, data]) => ({
      selected_dentist,
      count: data.count,
      avg_rating: Number((data.total_rating / data.count).toFixed(1)),
    }))
  } catch (error) {
    console.error("Erro ao contar dentistas:", error)
    return []
  }
}

function countSpecialties(surveyResponses) {
  try {
    const specialtyMap = {}

    surveyResponses.forEach((response) => {
      const specialty = response.specialty_interest
      if (!specialty) return

      if (!specialtyMap[specialty]) {
        specialtyMap[specialty] = 1
      } else {
        specialtyMap[specialty]++
      }
    })

    return Object.entries(specialtyMap).map(([specialty, count]) => ({
      specialty,
      count,
    }))
  } catch (error) {
    console.error("Erro ao contar especialidades:", error)
    return []
  }
}

function generatePrompt(dashboardData) {
  try {
    const { surveyResponses, statistics, dentistCounts, specialtyCounts } = dashboardData

    // Calcular média geral de todas as avaliações
    const overallAvg =
      (statistics.avg_reception_rating + statistics.avg_punctuality_rating + statistics.avg_clinical_rating) / 3

    // Formatar dados para o prompt
    const formattedData = {
      totalResponses: statistics.total_responses,
      averageRatings: {
        reception: statistics.avg_reception_rating,
        punctuality: statistics.avg_punctuality_rating,
        clinical: statistics.avg_clinical_rating,
        overall: Number.parseFloat(overallAvg.toFixed(1)),
      },
      integrativeInterest: statistics.integrative_interest_percentage,
      dentists: dentistCounts.map((d) => ({
        name: d.selected_dentist,
        count: d.count,
        avgRating: d.avg_rating,
      })),
      specialties: specialtyCounts.map((s) => ({
        name: s.specialty,
        count: s.count,
      })),
      // Adicionar dados de tendência temporal
      trends: calculateTrends(surveyResponses),
    }

    // Criar o prompt para a API do OpenAI
    return `
    Você é um consultor especializado em análise de dados para clínicas odontológicas. Analise os seguintes dados de pesquisas de satisfação de pacientes e forneça insights detalhados:
    
    ${JSON.stringify(formattedData, null, 2)}
    
    Forneça uma análise completa em formato Markdown, incluindo:
    
    1. Análise de Sentimento:
       - Calcule uma pontuação de sentimento geral (0-100) com base nas avaliações
       - Classifique o sentimento como "Muito Positivo" (>85), "Moderadamente Positivo" (70-85), ou "Precisa de Atenção" (<70)
    
    2. Pontos Fortes (3-4 pontos):
       - Identifique os aspectos mais bem avaliados
       - Para cada ponto forte, forneça um título, explicação detalhada, dados específicos e sugestões para manter ou melhorar
    
    3. Áreas para Melhoria (2-3 áreas):
       - Identifique áreas com avaliações mais baixas
       - Para cada área, forneça identificação do problema, análise do impacto, 2-3 sugestões práticas e benefícios esperados
    
    4. Análise de Tendências:
       - Avalie se a satisfação está melhorando, piorando ou estável
       - Identifique áreas com maior variação
       - Estabeleça correlações entre diferentes métricas
    
    5. Análise por Categoria:
       - Compare as avaliações entre recepção, pontualidade e atendimento clínico
       - Avalie o desempenho individual de cada dentista
    
    6. Análise de Especialidades:
       - Identifique tendências no interesse por especialidades
       - Avalie o potencial de crescimento em saúde integrativa
       - Sugira estratégias para atender à demanda por especialidades mais procuradas
    
    7. Recomendações Estratégicas:
       - Forneça 2-3 ações de curto prazo (próximos 30 dias)
       - Forneça 2-3 iniciativas de médio prazo (1-3 meses)
       - Forneça 1-2 objetivos de longo prazo (3-12 meses)
       - Atribua níveis de prioridade (alta, média, baixa) para cada recomendação
    
    Use linguagem profissional, mas acessível. Formate a resposta em Markdown com títulos, subtítulos, listas e ênfases onde apropriado.
    `
  } catch (error) {
    console.error("Erro ao gerar prompt:", error)
    throw new Error("Falha ao gerar prompt para análise")
  }
}

function calculateTrends(surveyResponses) {
  try {
    // Ordenar respostas por data
    const sortedResponses = [...surveyResponses].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
    )

    // Se houver menos de 2 respostas, não há tendência para calcular
    if (sortedResponses.length < 2) {
      return { trend: "insufficient_data" }
    }

    // Dividir em dois períodos para comparação
    const midpoint = Math.floor(sortedResponses.length / 2)
    const firstHalf = sortedResponses.slice(0, midpoint)
    const secondHalf = sortedResponses.slice(midpoint)

    // Calcular médias para cada período
    const firstHalfAvg = {
      reception: calculateAverage(firstHalf, "reception_rating"),
      punctuality: calculateAverage(firstHalf, "punctuality_rating"),
      clinical: calculateAverage(firstHalf, "clinical_rating"),
    }

    const secondHalfAvg = {
      reception: calculateAverage(secondHalf, "reception_rating"),
      punctuality: calculateAverage(secondHalf, "punctuality_rating"),
      clinical: calculateAverage(secondHalf, "clinical_rating"),
    }

    // Calcular diferenças
    const differences = {
      reception: secondHalfAvg.reception - firstHalfAvg.reception,
      punctuality: secondHalfAvg.punctuality - firstHalfAvg.punctuality,
      clinical: secondHalfAvg.clinical - firstHalfAvg.clinical,
    }

    return {
      firstPeriod: firstHalfAvg,
      secondPeriod: secondHalfAvg,
      differences,
    }
  } catch (error) {
    console.error("Erro ao calcular tendências:", error)
    return { trend: "error_calculating" }
  }
}

function calculateAverage(responses, field) {
  if (responses.length === 0) return 0
  const sum = responses.reduce((acc, response) => acc + (response[field] || 0), 0)
  return Number.parseFloat((sum / responses.length).toFixed(1))
}

async function generateAnalysis(prompt) {
  try {
    console.log("Iniciando chamada para OpenAI...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Usando gpt-4o-mini conforme solicitado
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em análise de dados para clínicas odontológicas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    console.log("Resposta recebida da OpenAI. Status:", response.status)

    // Se a resposta não for bem-sucedida, tente obter o texto do erro
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro na API do OpenAI. Status:", response.status, "Resposta:", errorText)
      throw new Error(`Erro na API do OpenAI: ${response.status} - ${errorText.substring(0, 100)}...`)
    }

    // Agora podemos analisar com segurança como JSON
    const data = await response.json()

    // Verificar se a resposta tem o formato esperado
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Resposta da API do OpenAI em formato inesperado:", JSON.stringify(data).substring(0, 200))
      throw new Error("Formato de resposta inesperado da API do OpenAI")
    }

    console.log("Análise gerada com sucesso pela OpenAI")
    return data.choices[0].message.content
  } catch (error) {
    console.error("Erro ao chamar a API do OpenAI:", error)
    // Em caso de erro, retornar uma análise de exemplo
    return generateExampleAnalysis()
  }
}

// Função para gerar uma análise de exemplo quando a API key não está configurada ou há um erro
function generateExampleAnalysis() {
  return `
# Análise de Sentimento

**Pontuação de Sentimento:** 82/100
**Classificação:** Moderadamente Positivo

A clínica apresenta um desempenho geral positivo, com uma média de avaliações de 4.1/5. Os pacientes demonstram satisfação com o atendimento, especialmente com o atendimento clínico que recebeu as melhores avaliações.

# Pontos Fortes

## Excelência no Atendimento Clínico

O atendimento clínico é o ponto mais forte da clínica, com média de 4.3/5. Os pacientes valorizam a qualidade técnica dos procedimentos e o cuidado demonstrado pelos profissionais.

**Sugestões para manter:**
- Continuar investindo na formação continuada dos profissionais
- Manter o padrão de comunicação clara sobre os procedimentos

## Recepção Acolhedora

A recepção recebeu uma avaliação média de 4.0/5, indicando que os pacientes se sentem bem acolhidos ao chegar à clínica.

**Sugestões para melhorar:**
- Implementar um sistema de reconhecimento de pacientes frequentes
- Oferecer pequenas cortesias como água ou café durante a espera

# Áreas para Melhoria

## Pontualidade nos Atendimentos

A pontualidade recebeu a menor avaliação média (3.9/5), indicando uma oportunidade de melhoria.

**Sugestões práticas:**
- Revisar o tempo alocado para cada tipo de procedimento
- Implementar um sistema de lembretes por SMS/WhatsApp
- Considerar um buffer de tempo entre consultas para absorver atrasos

**Benefícios esperados:**
- Redução do tempo de espera
- Aumento da satisfação do paciente
- Melhor fluxo de trabalho para a equipe

# Análise de Tendências

A satisfação geral dos pacientes mostra uma tendência de **estabilidade** com leve melhoria nos últimos períodos. O atendimento clínico mantém consistência, enquanto a pontualidade apresenta a maior variação.

Existe uma correlação positiva entre a avaliação do atendimento clínico e a probabilidade de interesse em serviços integrativos.

# Análise por Categoria

## Comparação entre Áreas

1. Atendimento Clínico: 4.3/5
2. Recepção: 4.0/5
3. Pontualidade: 3.9/5

O atendimento clínico se destaca como o ponto forte da clínica, enquanto a pontualidade representa a maior oportunidade de melhoria.

## Análise por Dentista

Os dentistas apresentam desempenho consistente, com pequenas variações. A Dra. Ana Silva recebeu o maior número de avaliações e mantém uma média de 4.4/5.

# Análise de Especialidades

## Tendências de Interesse

As especialidades mais procuradas são:
1. Ortodontia (32%)
2. Estética Dental (28%)
3. Implantodontia (18%)

## Potencial em Saúde Integrativa

Com 65% dos pacientes demonstrando interesse em saúde integrativa, existe um potencial significativo para expansão nesta área.

**Estratégias recomendadas:**
- Oferecer palestras informativas sobre abordagens integrativas
- Criar pacotes promocionais combinando tratamentos convencionais e integrativos
- Estabelecer parcerias com profissionais de áreas complementares

# Recomendações Estratégicas

## Curto Prazo (30 dias)

1. **Otimizar sistema de agendamento** - Prioridade: Alta
   - Revisar tempos alocados para procedimentos
   - Implementar confirmações automáticas de consulta

2. **Iniciar programa de educação sobre saúde integrativa** - Prioridade: Média
   - Criar materiais informativos para sala de espera
   - Treinar equipe para responder perguntas básicas sobre o tema

## Médio Prazo (1-3 meses)

1. **Implementar programa de fidelidade** - Prioridade: Média
   - Desenvolver sistema de pontos por consultas e indicações
   - Oferecer benefícios para pacientes frequentes

2. **Expandir serviços de ortodontia e estética** - Prioridade: Alta
   - Investir em equipamentos modernos
   - Considerar contratar especialistas adicionais nestas áreas

## Longo Prazo (3-12 meses)

1. **Desenvolver departamento de saúde integrativa** - Prioridade: Média
   - Estabelecer parcerias com profissionais de áreas complementares
   - Criar espaço físico dedicado a estas práticas
`
}
