import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || new Date().getMonth() + 1 + "")
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear() + "")

    // Criar cliente Supabase do servidor (com service role key)
    const supabase = createServerSupabaseClient()

    // Datas para o mês selecionado
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]

    console.log(`Buscando dados de ${startDate} até ${endDate}`)

    // Contar o total de registros no fluxo de caixa
    const { count: totalRecords, error: countError } = await supabase
      .from("finance_cash_flow")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Erro ao contar registros:", countError)
      return NextResponse.json({ error: `Erro ao contar registros: ${countError.message}` }, { status: 500 })
    }

    // Buscar uma amostra dos dados mais recentes
    const { data: cashFlowSample, error: sampleError } = await supabase
      .from("finance_cash_flow")
      .select("*")
      .order("date", { ascending: false })
      .limit(10)

    if (sampleError) {
      console.error("Erro ao buscar amostra:", sampleError)
      return NextResponse.json({ error: `Erro ao buscar amostra: ${sampleError.message}` }, { status: 500 })
    }

    // Buscar dados do fluxo de caixa para o mês selecionado
    const { data: monthData, error: monthError } = await supabase
      .from("finance_cash_flow")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (monthError) {
      console.error("Erro ao buscar dados do mês:", monthError)
      return NextResponse.json({ error: `Erro ao buscar dados do mês: ${monthError.message}` }, { status: 500 })
    }

    // Buscar dados com problemas de data
    const { data: invalidDates, error: invalidDatesError } = await supabase
      .from("finance_cash_flow")
      .select("*")
      .or("date.is.null")
      .limit(10)

    if (invalidDatesError) {
      console.error("Erro ao buscar datas inválidas:", invalidDatesError)
    }

    return NextResponse.json({
      totalRecords,
      cashFlowSample,
      monthData: {
        period: { startDate, endDate },
        count: monthData?.length || 0,
        data: monthData,
      },
      invalidDates: {
        count: invalidDates?.length || 0,
        data: invalidDates,
      },
    })
  } catch (error: any) {
    console.error("Erro na API de verificação de dados:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
