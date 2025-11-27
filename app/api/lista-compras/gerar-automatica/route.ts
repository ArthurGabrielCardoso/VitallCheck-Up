import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all materials that need restocking
    const { data: materiais, error: matError } = await supabase.from("materiais").select("*").eq("ativo", true)

    if (matError) throw matError

    // Get all pending items in shopping list to avoid duplicates
    const { data: pendingItems, error: pendingError } = await supabase
      .from("lista_compras")
      .select("material_id")
      .eq("status", "pendente")

    if (pendingError) throw pendingError

    // Create a Set of material IDs already in pending list
    const pendingMaterialIds = new Set((pendingItems || []).map((item) => item.material_id))

    const itensParaAdicionar = []

    for (const material of materiais || []) {
      const estoque = material.quantidade_estoque || 0
      const minimo = material.quantidade_minima || 0

      // Check if needs restocking and not already in pending list
      if (estoque <= minimo && minimo > 0 && !pendingMaterialIds.has(material.id)) {
        const quantidadeSugerida = minimo - estoque + Math.ceil(minimo * 0.2) // Add 20% buffer
        const percentual = minimo > 0 ? (estoque / minimo) * 100 : 0
        const prioridade = percentual < 50 ? "urgente" : percentual < 100 ? "alta" : "normal"

        itensParaAdicionar.push({
          material_id: material.id,
          quantidade_sugerida: quantidadeSugerida,
          prioridade,
          status: "pendente",
        })
      }
    }

    if (itensParaAdicionar.length > 0) {
      const { error: insertError } = await supabase.from("lista_compras").insert(itensParaAdicionar)

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      message: `${itensParaAdicionar.length} itens adicionados à lista de compras`,
    })
  } catch (error) {
    console.error("Erro ao gerar lista:", error)
    return NextResponse.json({ error: "Erro ao gerar lista de compras" }, { status: 500 })
  }
}
