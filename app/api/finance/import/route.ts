import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Log do corpo da requisição para depuração
    const requestBody = await request.json()
    console.log("Corpo da requisição recebido:", JSON.stringify(requestBody).substring(0, 500) + "...")

    const { cashFlowData, fileName, clearExistingData, month, year } = requestBody

    if (!cashFlowData || !Array.isArray(cashFlowData) || cashFlowData.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Log dos primeiros registros para depuração
    console.log("Primeiros 3 registros recebidos:", JSON.stringify(cashFlowData.slice(0, 3), null, 2))

    // Criar cliente Supabase do servidor
    const supabase = createServerSupabaseClient()

    // Verificar colunas da tabela
    const { data: tableInfo, error: tableError } = await supabase.from("finance_cash_flow").select("*").limit(1)

    if (tableError) {
      console.error("Erro ao verificar estrutura da tabela:", tableError)
      return NextResponse.json(
        { error: `Erro ao verificar estrutura da tabela: ${tableError.message}` },
        { status: 500 },
      )
    }

    // Determinar colunas disponíveis
    const availableColumns = tableInfo ? Object.keys(tableInfo[0] || {}) : []
    console.log("Colunas disponíveis na tabela:", availableColumns)

    // Processar e validar os dados - ABORDAGEM SUPER SIMPLIFICADA
    const processedData = []
    const invalidData = []

    for (let i = 0; i < cashFlowData.length; i++) {
      const item = cashFlowData[i]

      // Log para depuração
      if (i < 3) {
        console.log(`Processando item ${i}:`, JSON.stringify(item))
      }

      // Verificar se o item tem a propriedade date
      if (!item || typeof item !== "object") {
        console.warn(`Registro ${i} ignorado: não é um objeto válido`)
        invalidData.push({
          index: i,
          error: "Não é um objeto válido",
          item: item,
        })
        continue
      }

      // Verificar se a propriedade date existe
      if (!("date" in item)) {
        console.warn(`Registro ${i} ignorado: não possui propriedade 'date'`)
        invalidData.push({
          index: i,
          error: "Não possui propriedade 'date'",
          item: item,
        })
        continue
      }

      // Converter a data do formato DD/MM/YYYY para YYYY-MM-DD
      let formattedDate = null
      const dateValue = item.date

      // Log para depuração
      if (i < 3) {
        console.log(`Item ${i} - valor da data:`, dateValue, typeof dateValue)
      }

      if (dateValue && typeof dateValue === "string") {
        // Tentar formato DD/MM/YYYY
        const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        const match = dateValue.match(ddmmyyyyRegex)

        if (match) {
          const day = match[1].padStart(2, "0")
          const month = match[2].padStart(2, "0")
          const year = match[3]
          formattedDate = `${year}-${month}-${day}`

          // Log para depuração
          if (i < 3) {
            console.log(`Item ${i} - data convertida:`, formattedDate)
          }
        } else {
          // Já está no formato YYYY-MM-DD?
          const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/
          if (yyyymmddRegex.test(dateValue)) {
            formattedDate = dateValue

            // Log para depuração
            if (i < 3) {
              console.log(`Item ${i} - data já está no formato correto:`, formattedDate)
            }
          }
        }
      }

      // Se a data não for válida, pular este registro
      if (!formattedDate) {
        console.warn(`Registro ${i} ignorado: data inválida`, {
          originalDate: dateValue,
        })
        invalidData.push({
          index: i,
          originalDate: dateValue,
          error: "Formato de data inválido",
        })
        continue
      }

      // Normalizar o tipo
      let normalizedType = item.type
      if (typeof normalizedType === "string") {
        const isForecast = normalizedType.includes("_FORECAST")
        normalizedType = normalizedType.replace("_FORECAST", "")

        if (normalizedType.toUpperCase() === "IN") {
          normalizedType = "income"
        } else if (normalizedType.toUpperCase() === "OUT") {
          normalizedType = "expense"
        }
      }

      // Criar objeto com colunas válidas
      const cleanItem = {
        date: formattedDate,
        type: normalizedType,
        description: item.description || "",
        amount:
          typeof item.amount === "string"
            ? Number.parseFloat(item.amount.replace(/[R$\s]/g, "").replace(",", "."))
            : Number(item.amount),
        reference_type: item.type && item.type.includes("_FORECAST") ? "forecast" : "actual",
      }

      // Log para depuração
      if (i < 3) {
        console.log(`Item ${i} - objeto processado:`, cleanItem)
      }

      // Adicionar à lista de registros válidos
      processedData.push(cleanItem)
    }

    // Verificar se há registros válidos
    if (processedData.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum registro com data válida encontrado",
          details: {
            totalRecords: cashFlowData.length,
            invalidRecords: invalidData,
            sampleData: cashFlowData.slice(0, 3),
          },
        },
        { status: 400 },
      )
    }

    console.log(`Total de registros a serem inseridos: ${processedData.length} (de ${cashFlowData.length} originais)`)
    console.log("Primeiro registro a ser inserido:", processedData[0])

    // Limpar dados existentes se solicitado
    if (clearExistingData && month && year) {
      const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]
      const endDate = new Date(year, month, 0).toISOString().split("T")[0]

      console.log(`Limpando dados existentes de ${startDate} até ${endDate}`)

      const { error: deleteError } = await supabase
        .from("finance_cash_flow")
        .delete()
        .gte("date", startDate)
        .lte("date", endDate)

      if (deleteError) {
        console.error("Erro ao limpar dados existentes:", deleteError)
        return NextResponse.json({ error: `Erro ao limpar dados existentes: ${deleteError.message}` }, { status: 500 })
      }
    }

    // Inserir dados no banco
    const { data: insertedData, error: insertError } = await supabase
      .from("finance_cash_flow")
      .insert(processedData)
      .select()

    if (insertError) {
      console.error("Erro ao inserir no fluxo de caixa:", insertError)
      return NextResponse.json({ error: `Erro ao inserir no fluxo de caixa: ${insertError.message}` }, { status: 500 })
    }

    console.log(`Dados inseridos com sucesso: ${insertedData?.length || 0} registros`)

    return NextResponse.json({
      success: true,
      message: "Dados importados com sucesso",
      details: {
        totalRecords: processedData.length,
        skippedRecords: cashFlowData.length - processedData.length,
        invalidRecords: invalidData.length,
      },
    })
  } catch (error: any) {
    console.error("Erro na API de importação:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
