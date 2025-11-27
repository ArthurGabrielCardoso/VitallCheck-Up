import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    const supabase = createServerSupabaseClient()

    const { data: updated, error } = await supabase
      .from("lista_compras")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`*, material:materiais(*)`)
      .single()

    if (error) {
      console.error("Erro ao atualizar item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("lista_compras").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}
