import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createServerSupabaseClient()

    // First delete related baixa_estoque_procedimento records
    await supabase.from("baixa_estoque_procedimento").delete().eq("registro_procedimento_id", id)

    const { error } = await supabase.from("registro_procedimentos").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover registro:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}
