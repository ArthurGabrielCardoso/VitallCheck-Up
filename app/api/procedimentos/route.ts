import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("procedimentos")
      .select(`
        *,
        procedimento_material (
          quantidade,
          material:materiais (
            valor_fracionado
          )
        )
      `)
      .order("nome")

    if (error) {
      console.error("Erro ao buscar procedimentos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const procedimentosComCusto = data.map((proc: any) => {
      const custoMateriais =
        proc.procedimento_material?.reduce((total: number, item: any) => {
          const valorMaterial = item.material?.valor_fracionado || 0
          return total + valorMaterial * item.quantidade
        }, 0) || 0

      // Remove the nested data to keep the response clean (optional, but good for bandwidth)
      // We keep the original fields and add the calculated cost
      const { procedimento_material, ...rest } = proc
      return {
        ...rest,
        custo_materiais: custoMateriais,
      }
    })

    return NextResponse.json(procedimentosComCusto)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { codigo, nome, valor } = body

    if (!codigo) {
      return NextResponse.json({ error: "Código do procedimento é obrigatório" }, { status: 400 })
    }

    if (!nome) {
      return NextResponse.json({ error: "Nome do procedimento é obrigatório" }, { status: 400 })
    }

    if (valor === undefined || valor === null || isNaN(valor)) {
      return NextResponse.json(
        { error: "Valor do procedimento é obrigatório e deve ser um número válido" },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("procedimentos").insert({ codigo, nome, valor }).select().single()

    if (error) {
      console.error("Erro ao criar procedimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
