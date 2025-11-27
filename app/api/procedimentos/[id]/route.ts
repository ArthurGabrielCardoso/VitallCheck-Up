import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("procedimentos").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { nome, codigo, especialidade, valor, laboratorio, hr, lucro_percent } = body

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("procedimentos")
      .update({
        nome,
        codigo,
        especialidade,
        valor,
        laboratorio,
        hr,
        lucro_percent,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("procedimentos").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
