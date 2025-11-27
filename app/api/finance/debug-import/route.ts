import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Extrair informações relevantes
    const { cashFlowData } = body

    // Verificar se cashFlowData é um array
    if (!Array.isArray(cashFlowData)) {
      return NextResponse.json({
        error: "cashFlowData não é um array",
        receivedType: typeof cashFlowData,
        receivedValue: cashFlowData,
      })
    }

    // Analisar os primeiros registros
    const sampleData = cashFlowData.slice(0, 5).map((item, index) => {
      return {
        index,
        hasDateProperty: "date" in item,
        dateValue: item.date,
        dateType: typeof item.date,
        isValidFormat: typeof item.date === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(item.date),
        fullItem: item,
      }
    })

    return NextResponse.json({
      success: true,
      totalRecords: cashFlowData.length,
      sampleData,
      fullSample: cashFlowData.slice(0, 2),
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Erro interno",
      stack: error.stack,
    })
  }
}
