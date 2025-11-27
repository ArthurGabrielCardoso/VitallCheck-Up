import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { materiais } = await request.json()

    if (!Array.isArray(materiais) || materiais.length === 0) {
      return NextResponse.json({ error: "Lista de materiais inválida ou vazia" }, { status: 400 })
    }

    console.log(`Importando ${materiais.length} materiais em lote`)

    // Validar todos os materiais antes de inserir
    const materiaisValidos = materiais.filter((material) => {
      const { nome, valor_embalagem, qtde_embalagem, rendimento, valor_fracionado } = material

      return (
        nome &&
        nome.trim() !== "" &&
        !isNaN(valor_embalagem) &&
        valor_embalagem > 0 &&
        qtde_embalagem &&
        qtde_embalagem.trim() !== "" &&
        rendimento &&
        rendimento.trim() !== "" &&
        !isNaN(valor_fracionado) &&
        valor_fracionado >= 0
      )
    })

    if (materiaisValidos.length === 0) {
      return NextResponse.json({ error: "Nenhum material válido para importar" }, { status: 400 })
    }

    // Inserir todos os materiais de uma vez
    const { data, error } = await supabase.from("materiais").insert(materiaisValidos).select()

    if (error) {
      console.error("Erro ao importar materiais em lote:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${data.length} materiais importados com sucesso`,
      data,
    })
  } catch (error) {
    console.error("Erro ao processar importação em lote:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar importação em lote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
