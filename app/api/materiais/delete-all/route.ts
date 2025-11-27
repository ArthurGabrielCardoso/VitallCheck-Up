import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()

    // Primeiro, remover todas as relações em procedimento_material
    const { error: relationsError } = await supabase.from("procedimento_material").delete().neq("material_id", 0) // Condição para garantir que a operação afete todas as linhas

    if (relationsError) {
      console.error("Erro ao remover relações de materiais:", relationsError)
      return NextResponse.json({ error: relationsError.message }, { status: 500 })
    }

    // Depois, remover todos os materiais
    const { error } = await supabase.from("materiais").delete().neq("id", 0) // Condição para garantir que a operação afete todas as linhas

    if (error) {
      console.error("Erro ao deletar todos os materiais:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Todos os materiais foram removidos com sucesso" })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
