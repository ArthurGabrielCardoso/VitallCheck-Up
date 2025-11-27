import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data")

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("registro_procedimentos")
      .select(`
        *,
        procedimento:procedimentos(*)
      `)
      .order("data", { ascending: false })

    if (data) {
      query = query.eq("data", data)
    }

    const { data: registros, error } = await query

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(registros || [])
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { data: dataRegistro, procedimento_id, quantidade, observacoes, realizar_baixa } = data

    if (!procedimento_id || !quantidade) {
      return NextResponse.json({ error: "Procedimento e quantidade são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Create the registro
    const { data: registro, error: regError } = await supabase
      .from("registro_procedimentos")
      .insert({
        data: dataRegistro || new Date().toISOString().split("T")[0],
        procedimento_id,
        quantidade,
        observacoes,
        baixa_estoque_realizada: realizar_baixa || false,
      })
      .select(`*, procedimento:procedimentos(*)`)
      .single()

    if (regError) {
      console.error("Erro ao criar registro:", regError)
      return NextResponse.json({ error: regError.message }, { status: 500 })
    }

    // If realizar_baixa is true, deduct materials from stock
    if (realizar_baixa) {
      // Get materials for this procedimento
      const { data: procMateriais, error: pmError } = await supabase
        .from("procedimento_material")
        .select(`
          *,
          material:materiais(*)
        `)
        .eq("procedimento_id", procedimento_id)

      if (pmError) {
        console.error("Erro ao buscar materiais:", pmError)
      } else if (procMateriais && procMateriais.length > 0) {
        for (const pm of procMateriais) {
          const quantidadeBaixar = (pm.quantidade || 1) * quantidade
          const estoqueAtual = pm.material?.quantidade_estoque || 0
          const novoEstoque = Math.max(0, estoqueAtual - quantidadeBaixar)

          // Update material stock
          await supabase.from("materiais").update({ quantidade_estoque: novoEstoque }).eq("id", pm.material_id)

          // Log the stock movement
          await supabase.from("baixa_estoque_procedimento").insert({
            registro_procedimento_id: registro.id,
            material_id: pm.material_id,
            quantidade_baixada: quantidadeBaixar,
            quantidade_anterior: estoqueAtual,
            quantidade_nova: novoEstoque,
          })

          // Also log in historico_estoque
          await supabase.from("historico_estoque").insert({
            material_id: pm.material_id,
            tipo: "saida",
            quantidade: quantidadeBaixar,
            quantidade_anterior: estoqueAtual,
            quantidade_nova: novoEstoque,
            motivo: `Procedimento: ${registro.procedimento?.nome || "N/A"} (${quantidade}x)`,
          })
        }
      }
    }

    return NextResponse.json(registro)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}
