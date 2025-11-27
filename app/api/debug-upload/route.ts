import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Apenas retorna os dados recebidos para debug
    return NextResponse.json({
      success: true,
      message: "Dados recebidos com sucesso",
      data: body,
    })
  } catch (error) {
    console.error("Erro ao processar requisição de debug:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar requisição",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
