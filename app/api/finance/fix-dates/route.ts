import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Criar cliente Supabase do servidor (com service role key)
    const supabase = createServerSupabaseClient()

    // Buscar todos os registros do fluxo de caixa
    const { data: cashFlowData, error: fetchError } = await supabase.from("finance_cash_flow").select("*")

    if (fetchError) {
      console.error("Erro ao buscar dados do fluxo de caixa:", fetchError)
      return NextResponse.json({ error: `Erro ao buscar dados: ${fetchError.message}` }, { status: 500 })
    }

    console.log(`Total de registros encontrados: ${cashFlowData?.length || 0}`)

    // Se não houver dados, retornar
    if (!cashFlowData || cashFlowData.length === 0) {
      return NextResponse.json({ message: "Nenhum dado encontrado para corrigir" })
    }

    // Verificar e corrigir as datas
    let correctedCount = 0
    let alreadyCorrectCount = 0
    let errorCount = 0

    for (const item of cashFlowData) {
      try {
        // Verificar se a data está no formato correto (YYYY-MM-DD)
        const currentDate = item.date
        let needsUpdate = false
        let formattedDate = currentDate

        // Verificar se a data está em um formato diferente
        if (currentDate && typeof currentDate === "string") {
          // Verificar se a data está no formato DD/MM/YYYY
          if (currentDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = currentDate.split("/")
            formattedDate = `${year}-${month}-${day}`
            needsUpdate = true
          }

          // Verificar se a data é válida
          try {
            const testDate = new Date(formattedDate)
            if (isNaN(testDate.getTime())) {
              console.warn(`Data inválida encontrada: ${formattedDate}, usando data atual como fallback`)
              formattedDate = new Date().toISOString().split("T")[0]
              needsUpdate = true
            }
          } catch (e) {
            console.warn(`Erro ao processar data: ${formattedDate}, usando data atual como fallback`)
            formattedDate = new Date().toISOString().split("T")[0]
            needsUpdate = true
          }
        }

        // Se a data precisar ser atualizada
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from("finance_cash_flow")
            .update({ date: formattedDate })
            .eq("id", item.id)

          if (updateError) {
            console.error(`Erro ao atualizar registro ${item.id}:`, updateError)
            errorCount++
          } else {
            correctedCount++
          }
        } else {
          alreadyCorrectCount++
        }
      } catch (err) {
        console.error(`Erro ao processar registro ${item.id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verificação e correção de datas concluída",
      details: {
        totalRecords: cashFlowData.length,
        correctedCount,
        alreadyCorrectCount,
        errorCount,
      },
    })
  } catch (error: any) {
    console.error("Erro na API de correção de datas:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
