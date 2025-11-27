import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const procedimentoId = searchParams.get("procedimento_id")

    // Verificar se o procedimentoId é válido
    if (!procedimentoId) {
      console.error("ID do procedimento não fornecido")
      return NextResponse.json({ error: "ID do procedimento é obrigatório" }, { status: 400 })
    }

    // Converter para número e verificar se é válido
    const procedimentoIdNum = Number.parseInt(procedimentoId)
    if (isNaN(procedimentoIdNum)) {
      console.error(`ID do procedimento inválido: ${procedimentoId}`)
      return NextResponse.json({ error: "ID do procedimento inválido" }, { status: 400 })
    }

    console.log(`Buscando materiais para o procedimento ID: ${procedimentoIdNum}`)

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("procedimento_material")
      .select(`
        *,
        material:material_id (*)
      `)
      .eq("procedimento_id", procedimentoIdNum)

    if (error) {
      console.error("Erro ao buscar materiais do procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { procedimento_id, material_id, quantidade } = body

    if (!procedimento_id || !material_id || !quantidade) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verificar se já existe essa associação
    const { data: existingData } = await supabase
      .from("procedimento_material")
      .select("*")
      .eq("procedimento_id", procedimento_id)
      .eq("material_id", material_id)
      .single()

    if (existingData) {
      // Atualizar a quantidade
      const { data, error } = await supabase
        .from("procedimento_material")
        .update({ quantidade })
        .eq("id", existingData.id)
        .select()
        .single()

      if (error) {
        console.error("Erro ao atualizar material do procedimento:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Criar nova associação
      const { data, error } = await supabase
        .from("procedimento_material")
        .insert({
          procedimento_id,
          material_id,
          quantidade,
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao adicionar material ao procedimento:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
