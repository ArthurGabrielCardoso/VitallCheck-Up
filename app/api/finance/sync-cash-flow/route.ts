import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 1. Buscar todas as despesas
    const { data: expenses, error: expensesError } = await supabase
      .from("finance_expenses")
      .select("*")
      .order("due_date", { ascending: true })

    if (expensesError) {
      return NextResponse.json({ error: `Erro ao buscar despesas: ${expensesError.message}` }, { status: 500 })
    }

    console.log(`Encontradas ${expenses.length} despesas para sincronização`)

    // 2. Buscar todas as receitas (se existirem)
    const { data: incomes, error: incomesError } = await supabase
      .from("finance_incomes")
      .select("*")
      .order("due_date", { ascending: true })
      .catch(() => ({ data: [], error: null })) // Tratar caso a tabela não exista

    if (incomesError) {
      console.warn(`Aviso: Não foi possível buscar receitas: ${incomesError.message}`)
    }

    console.log(`Encontradas ${incomes?.length || 0} receitas para sincronização`)

    // 3. Limpar fluxo de caixa existente
    const { error: deleteError } = await supabase.from("finance_cash_flow").delete().neq("id", 0)

    if (deleteError) {
      return NextResponse.json({ error: `Erro ao limpar fluxo de caixa: ${deleteError.message}` }, { status: 500 })
    }

    // 4. Converter despesas para fluxo de caixa
    const cashFlowItems = []

    // Adicionar despesas
    if (expenses && expenses.length > 0) {
      expenses.forEach((expense) => {
        cashFlowItems.push({
          date: expense.payment_date || expense.due_date,
          type: expense.payment_date ? "expense" : "expense_forecast",
          description: expense.description || "Despesa sem descrição",
          amount: expense.amount,
          reference_id: expense.id,
          reference_type: expense.payment_date ? "paid" : "forecast",
          category: expense.category || "Sem categoria",
          payment_method: expense.payment_method,
          supplier: expense.supplier,
          notes: expense.notes,
        })
      })
    }

    // Adicionar receitas (se existirem)
    if (incomes && incomes.length > 0) {
      incomes.forEach((income) => {
        cashFlowItems.push({
          date: income.payment_date || income.due_date,
          type: income.payment_date ? "income" : "income_forecast",
          description: income.description || "Receita sem descrição",
          amount: income.amount,
          reference_id: income.id,
          reference_type: income.payment_date ? "paid" : "forecast",
          category: income.category || "Sem categoria",
          payment_method: income.payment_method,
          customer: income.customer,
          notes: income.notes,
        })
      })
    }

    // 5. Inserir no fluxo de caixa
    if (cashFlowItems.length > 0) {
      // Inserir em lotes de 100 para evitar problemas com limites de tamanho
      const batchSize = 100
      for (let i = 0; i < cashFlowItems.length; i += batchSize) {
        const batch = cashFlowItems.slice(i, i + batchSize)
        const { error: insertError } = await supabase.from("finance_cash_flow").insert(batch)

        if (insertError) {
          return NextResponse.json(
            { error: `Erro ao inserir no fluxo de caixa (lote ${i / batchSize + 1}): ${insertError.message}` },
            { status: 500 },
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fluxo de caixa sincronizado com sucesso. ${cashFlowItems.length} itens processados.`,
    })
  } catch (error: any) {
    console.error("Erro na sincronização do fluxo de caixa:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
