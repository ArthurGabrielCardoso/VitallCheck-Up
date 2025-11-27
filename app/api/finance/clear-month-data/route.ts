import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const month = searchParams.get("month")

    if (!year || !month) {
      return NextResponse.json({ error: "Ano e mês são obrigatórios" }, { status: 400 })
    }

    // Criar cliente Supabase do servidor (com service role key)
    const supabase = createServerSupabaseClient()

    // Construir as datas de início e fim do mês
    const startDate = `${year}-${month.padStart(2, "0")}-01`
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]

    // Primeiro, vamos contar quantos registros existem para retornar essa informação
    const { count: totalCount, error: countError } = await supabase
      .from("finance_cash_flow")
      .select("*", { count: "exact", head: true })
      .gte("date", startDate)
      .lte("date", endDate)

    if (countError) {
      console.error("Erro ao contar registros:", countError)
      return NextResponse.json({ error: `Erro ao contar registros: ${countError.message}` }, { status: 500 })
    }

    // Excluir registros do mês especificado
    const { error: deleteError } = await supabase
      .from("finance_cash_flow")
      .delete()
      .gte("date", startDate)
      .lte("date", endDate)

    if (deleteError) {
      console.error("Erro ao limpar dados do mês:", deleteError)
      return NextResponse.json({ error: `Erro ao limpar dados do mês: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deletedCount: totalCount || 0,
      message: `Dados de ${month}/${year} removidos com sucesso`,
    })
  } catch (error: any) {
    console.error("Erro na API de limpeza de dados por mês:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
