import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("lista_compras")
      .select(`
        *,
        material:materiais(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar lista de compras:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { material_id, quantidade_sugerida, prioridade, observacoes, data_necessidade } = data

    if (!material_id) {
      return NextResponse.json({ error: "Material é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: existing, error: checkError } = await supabase
      .from("lista_compras")
      .select("id")
      .eq("material_id", material_id)
      .eq("status", "pendente")
      .maybeSingle()

    if (checkError) {
      console.error("Erro ao verificar existência:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existing) {
      // Update quantity instead of creating duplicate
      const { data: updated, error } = await supabase
        .from("lista_compras")
        .update({
          quantidade_sugerida: quantidade_sugerida,
          prioridade: prioridade || "normal",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select(`*, material:materiais(*)`)
        .single()

      if (error) throw error
      return NextResponse.json(updated)
    }

    const { data: newItem, error } = await supabase
      .from("lista_compras")
      .insert({
        material_id,
        quantidade_sugerida: quantidade_sugerida || 1,
        prioridade: prioridade || "normal",
        observacoes,
        data_necessidade,
        status: "pendente",
      })
      .select(`*, material:materiais(*)`)
      .single()

    if (error) {
      console.error("Erro ao adicionar item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newItem)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}
