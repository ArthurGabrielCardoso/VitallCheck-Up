import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const surveyData = await request.json()

    console.log("Dados recebidos na API:", surveyData)

    // Obter o IP do cliente (para fins de análise)
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Converter o formato dos dados para o formato esperado pelo Supabase
    const formattedData = {
      reception_rating: surveyData.receptionRating,
      punctuality_rating: surveyData.punctualityRating,
      selected_dentist: surveyData.selectedDentist,
      clinical_rating: surveyData.clinicalRating,
      integrative_interest: surveyData.integrativeInterest === "yes",
      specialties: surveyData.specialties.length > 0 ? surveyData.specialties : null,
      other_specialty: surveyData.otherSpecialty || null,
      comments: surveyData.comments || null,
      ip_address: ip,
      // Adicionar submitted_at explicitamente
      submitted_at: new Date().toISOString(),
    }

    console.log("Dados formatados para o Supabase:", formattedData)

    // Criar cliente Supabase
    const supabase = createServerSupabaseClient()

    // Inserir dados na tabela survey_responses
    const { data, error } = await supabase.from("survey_responses").insert(formattedData).select()

    if (error) {
      console.error("Erro ao inserir dados no Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao salvar a pesquisa: " + error.message,
        },
        { status: 500 },
      )
    }

    console.log("Dados salvos com sucesso:", data)

    // Retornar uma resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Pesquisa enviada com sucesso",
      data: data,
    })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)

    // Retornar uma resposta de erro
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
