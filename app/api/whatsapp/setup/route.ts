import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Criar tabela de contatos
    const { error: contactsError } = await supabase.rpc("create_whatsapp_contacts_table")

    if (contactsError) {
      return NextResponse.json({ error: "Erro ao criar tabela de contatos", details: contactsError }, { status: 500 })
    }

    // Criar tabela de campanhas
    const { error: campaignsError } = await supabase.rpc("create_whatsapp_campaigns_table")

    if (campaignsError) {
      return NextResponse.json({ error: "Erro ao criar tabela de campanhas", details: campaignsError }, { status: 500 })
    }

    // Criar tabela de mensagens
    const { error: messagesError } = await supabase.rpc("create_whatsapp_messages_table")

    if (messagesError) {
      return NextResponse.json({ error: "Erro ao criar tabela de mensagens", details: messagesError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas criadas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao configurar tabelas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
