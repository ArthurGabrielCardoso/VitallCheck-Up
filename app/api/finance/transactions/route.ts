import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Desabilita o cache da rota
export const revalidate = 0 // Força revalidação a cada requisição

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

    console.log(`Buscando transações de ${startDate} até ${endDate}`)

    // Buscar dados do fluxo de caixa para o mês selecionado
    const { data: transactions, error: transactionsError } = await supabase
      .from("finance_cash_flow")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (transactionsError) {
      console.error("Erro ao buscar transações:", transactionsError)
      return NextResponse.json({ error: `Erro ao buscar transações: ${transactionsError.message}` }, { status: 500 })
    }

    // Contar total de registros
    const { count: totalCount, error: countError } = await supabase
      .from("finance_cash_flow")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Erro ao contar registros:", countError)
    }

    // Adicionar timestamp para evitar cache
    const timestamp = new Date().toISOString()

    return NextResponse.json({
      data: transactions || [],
      count: transactions?.length || 0,
      totalCount: totalCount || 0,
      period: { month, year, startDate, endDate },
      timestamp,
    })
  } catch (error: any) {
    console.error("Erro na API de transações:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
