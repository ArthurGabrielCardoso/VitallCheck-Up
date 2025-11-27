import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID do material não fornecido" }, { status: 400 })
    }

    const data = await request.json()

    const updateData: Record<string, unknown> = {}

    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.valor_embalagem !== undefined) updateData.valor_embalagem = data.valor_embalagem
    if (data.qtde_embalagem !== undefined) updateData.qtde_embalagem = data.qtde_embalagem
    if (data.rendimento !== undefined) updateData.rendimento = data.rendimento
    if (data.valor_fracionado !== undefined) updateData.valor_fracionado = data.valor_fracionado
    if (data.quantidade_estoque !== undefined) updateData.quantidade_estoque = data.quantidade_estoque
    if (data.quantidade_minima !== undefined) updateData.quantidade_minima = data.quantidade_minima
    if (data.unidade_medida !== undefined) updateData.unidade_medida = data.unidade_medida
    if (data.fornecedor !== undefined) updateData.fornecedor = data.fornecedor
    if (data.data_validade !== undefined) updateData.data_validade = data.data_validade
    if (data.ativo !== undefined) updateData.ativo = data.ativo

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: updatedMaterial, error } = await supabase
      .from("materiais")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar material:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedMaterial)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID do material não fornecido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { error: relationsError } = await supabase.from("procedimento_material").delete().eq("material_id", id)

    if (relationsError) {
      console.error("Erro ao remover relações do material:", relationsError)
      return NextResponse.json({ error: relationsError.message }, { status: 500 })
    }

    const { error } = await supabase.from("materiais").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir material:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Material excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar a requisição" }, { status: 500 })
  }
}
