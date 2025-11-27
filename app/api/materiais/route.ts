import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Limitar o número de requisições por minuto
const MAX_REQUESTS_PER_MINUTE = 100
let requestCount = 0
let resetTime = Date.now() + 60000

// Função para verificar se podemos processar mais uma requisição
function canProcessRequest() {
  const now = Date.now()

  // Resetar o contador a cada minuto
  if (now > resetTime) {
    requestCount = 0
    resetTime = now + 60000
  }

  // Verificar se ainda podemos processar mais requisições
  if (requestCount < MAX_REQUESTS_PER_MINUTE) {
    requestCount++
    return true
  }

  return false
}

export async function GET() {
  try {
    if (!canProcessRequest()) {
      return NextResponse.json({ error: "Too Many Requests. Please try again later." }, { status: 429 })
    }

    // Usar createServerSupabaseClient em vez de createClient
    const supabase = createServerSupabaseClient()

    // Log para debug
    console.log("API de materiais: Iniciando busca")

    const { data, error } = await supabase.from("materiais").select("*").order("nome")

    if (error) {
      console.error("API de materiais: Erro ao buscar materiais:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`API de materiais: ${data?.length || 0} materiais encontrados`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("API de materiais: Erro não tratado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!canProcessRequest()) {
      return NextResponse.json({ error: "Too Many Requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { nome, valor_embalagem, qtde_embalagem, rendimento, valor_fracionado } = body

    // Validação mais robusta
    if (!nome || nome.trim() === "") {
      return NextResponse.json({ error: "Nome do material é obrigatório" }, { status: 400 })
    }

    if (isNaN(valor_embalagem) || valor_embalagem <= 0) {
      return NextResponse.json({ error: "Valor da embalagem deve ser um número positivo" }, { status: 400 })
    }

    if (!qtde_embalagem || qtde_embalagem.trim() === "") {
      return NextResponse.json({ error: "Quantidade da embalagem é obrigatória" }, { status: 400 })
    }

    if (!rendimento || rendimento.trim() === "") {
      return NextResponse.json({ error: "Rendimento é obrigatório" }, { status: 400 })
    }

    if (isNaN(valor_fracionado) || valor_fracionado < 0) {
      return NextResponse.json({ error: "Valor fracionado deve ser um número não negativo" }, { status: 400 })
    }

    // Usar createServerSupabaseClient em vez de createClient
    const supabase = createServerSupabaseClient()

    // Verificar se o material já existe
    const { data: existingMaterial } = await supabase.from("materiais").select("id").eq("nome", nome).maybeSingle()

    if (existingMaterial) {
      // Atualizar o material existente
      const { data, error } = await supabase
        .from("materiais")
        .update({
          valor_embalagem,
          qtde_embalagem,
          rendimento,
          valor_fracionado,
        })
        .eq("id", existingMaterial.id)
        .select()
        .single()

      if (error) {
        console.error("Erro ao atualizar material:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Criar novo material
      const { data, error } = await supabase
        .from("materiais")
        .insert({
          nome,
          valor_embalagem,
          qtde_embalagem,
          rendimento,
          valor_fracionado,
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar material:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
