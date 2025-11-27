import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("procedimento_material").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir material do procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
