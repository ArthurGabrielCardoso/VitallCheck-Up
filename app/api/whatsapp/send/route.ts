import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { contacts, messageTemplate, campaignName } = await request.json()

    if (!contacts || !messageTemplate || !campaignName) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Criar registro da campanha
    const { data: campaign, error: campaignError } = await supabase
      .from("whatsapp_campaigns")
      .insert({
        name: campaignName,
        template: messageTemplate,
        status: "in_progress",
        created_by: session.user.id,
      })
      .select()
      .single()

    if (campaignError) {
      console.error("Erro ao criar campanha:", campaignError)
      return NextResponse.json({ error: "Erro ao criar campanha" }, { status: 500 })
    }

    // Processar envio de mensagens (simulado)
    const results = await Promise.all(
      contacts.map(async (contact: any) => {
        // Personalizar mensagem com IA se necessário
        let personalizedMessage = messageTemplate

        if (messageTemplate.includes("{personalizado}")) {
          try {
            const { text } = await generateText({
              model: openai("gpt-4o"),
              prompt: `Crie uma mensagem personalizada para ${contact.name} baseada neste template: ${messageTemplate}. 
                      Mantenha o tom profissional e amigável. Não inclua saudações como "Prezado" ou "Atenciosamente".`,
            })
            personalizedMessage = messageTemplate.replace("{personalizado}", text)
          } catch (error) {
            console.error("Erro ao personalizar mensagem com IA:", error)
            personalizedMessage = messageTemplate.replace("{personalizado}", "")
          }
        }

        // Substituir variáveis básicas
        personalizedMessage = personalizedMessage.replace("{nome}", contact.name || "")

        // Aqui seria a integração real com a API do WhatsApp
        // Por enquanto, apenas simulamos o envio

        // Registrar mensagem no banco
        const { data: message, error: messageError } = await supabase
          .from("whatsapp_messages")
          .insert({
            campaign_id: campaign.id,
            contact_id: contact.id,
            message: personalizedMessage,
            status: "sent",
          })
          .select()
          .single()

        if (messageError) {
          console.error("Erro ao registrar mensagem:", messageError)
          return { contact, success: false, error: messageError }
        }

        return { contact, success: true, messageId: message.id }
      }),
    )

    // Atualizar status da campanha
    await supabase.from("whatsapp_campaigns").update({ status: "completed" }).eq("id", campaign.id)

    // Contar sucessos e falhas
    const successes = results.filter((r) => r.success).length
    const failures = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      campaign: campaign.id,
      stats: {
        total: results.length,
        sent: successes,
        failed: failures,
      },
    })
  } catch (error) {
    console.error("Erro ao processar envio de mensagens:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
