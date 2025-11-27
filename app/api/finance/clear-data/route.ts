import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    // Criar cliente Supabase do servidor (com service role key)
    const supabase = createServerSupabaseClient()

    // Primeiro, vamos contar quantos registros existem para retornar essa informação
    const { count: totalCount, error: countError } = await supabase
      .from("finance_cash_flow")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Erro ao contar registros:", countError)
      return NextResponse.json({ error: `Erro ao contar registros: ${countError.message}` }, { status: 500 })
    }

    // Para campos UUID, não podemos usar .neq("id", 0)
    // Vamos usar uma condição que sempre é verdadeira para campos UUID
    const { error: deleteError } = await supabase.from("finance_cash_flow").delete().not("id", "is", null) // Isso exclui todos os registros onde id não é nulo (ou seja, todos)

    if (deleteError) {
      console.error("Erro ao limpar dados:", deleteError)
      return NextResponse.json({ error: `Erro ao limpar dados: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedCount: totalCount || 0 })
  } catch (error: any) {
    console.error("Erro na API de limpeza de dados:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
