import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Criar cliente Supabase do servidor (com service role key que ignora RLS)
    const supabase = createServerSupabaseClient()

    // Obter o mês e ano atual
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Gerar dados para os últimos 7 dias
    const sampleData = []

    const generateRandomAmount = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1) + min) / 100
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentYear, currentMonth, today.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Gerar entre 1-3 entradas para cada dia
      const numIncomes = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numIncomes; j++) {
        const incomeTypes = ["PIX", "Dinheiro", "Transferência", "Cartão"]
        const incomeType = incomeTypes[Math.floor(Math.random() * incomeTypes.length)]
        const amount = generateRandomAmount(5000, 100000) // Entre R$ 50 e R$ 1000

        sampleData.push({
          date: dateStr,
          type: "income",
          description: incomeType,
          amount: amount,
          reference_type: "real",
        })
      }

      // Gerar entre 1-2 saídas para cada dia
      const numExpenses = Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < numExpenses; j++) {
        const expenseTypes = ["Pagamento", "Material", "Serviço", "Fornecedor"]
        const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]
        const amount = generateRandomAmount(3000, 50000) // Entre R$ 30 e R$ 500

        sampleData.push({
          date: dateStr,
          type: "expense",
          description: `${expenseType}`,
          amount: amount,
          reference_type: "real",
        })
      }
    }

    // Inserir dados no banco usando o cliente do servidor (ignora RLS)
    const { error, data } = await supabase.from("finance_cash_flow").insert(sampleData).select()

    if (error) {
      console.error("Erro ao inserir dados de exemplo:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${sampleData.length} transações de exemplo foram adicionadas.`,
    })
  } catch (error: any) {
    console.error("Erro na API de adicionar dados de exemplo:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
