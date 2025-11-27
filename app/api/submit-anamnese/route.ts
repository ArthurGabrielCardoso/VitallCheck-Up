import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const anamneseData = await request.json()

    console.log("Dados recebidos na API:", anamneseData)

    // Obter o IP do cliente (para fins de análise)
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Criar cliente Supabase
    const supabase = createServerSupabaseClient()

    // Verificar se a tabela existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("anamnese")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (tableCheckError) {
      console.error("Erro ao verificar tabela anamnese:", tableCheckError)

      // Tentar criar a tabela se ela não existir
      console.log("Tentando criar a tabela anamnese...")

      // Simplificar os dados para inserção
      const simplifiedData = {
        nome: anamneseData.nome,
        email: anamneseData.email,
        telefone: anamneseData.telefone,
        created_at: new Date().toISOString(),
        ip_address: ip,
      }

      // Inserir dados simplificados
      const { data, error } = await supabase.from("anamnese").insert(simplifiedData).select()

      if (error) {
        console.error("Erro detalhado ao inserir dados no Supabase:", JSON.stringify(error, null, 2))
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao salvar a anamnese: " + error.message,
            details: error,
          },
          { status: 500 },
        )
      }

      console.log("Dados salvos com sucesso (simplificados):", data)
      return NextResponse.json({
        success: true,
        message: "Anamnese enviada com sucesso (dados simplificados)",
        data: data,
      })
    }

    // Se a tabela existe, tente inserir os dados completos
    console.log("Tabela anamnese encontrada, inserindo dados completos...")

    // Preparar dados para inserção
    const insertData = {
      nome: anamneseData.nome,
      endereco: anamneseData.endereco,
      telefone: anamneseData.telefone,
      telefone_auxiliar: anamneseData.telefoneAuxiliar || null,
      email: anamneseData.email,
      instagram: anamneseData.instagram || null,

      // Campos booleanos
      tratamento_medico: anamneseData.tratamentoMedico === "sim",
      medicamento_continuo: anamneseData.medicamentoContinuo === "sim",
      hospitalizado: anamneseData.hospitalizado === "sim",
      gravida: anamneseData.gravida === "sim",
      dieta: anamneseData.dieta === "sim",
      alergia: anamneseData.alergia === "sim",
      alteracao_coagulacao: anamneseData.alteracaoCoagulacao === "sim",
      febre_reumatica: anamneseData.febreReumatica === "sim",
      doenca_autoimune: anamneseData.doencaAutoimune === "sim",
      doenca_renal_hepatica: anamneseData.doencaRenalHepatica === "sim",
      diabetes: anamneseData.diabetes === "sim",
      doenca_cardiovascular: anamneseData.doencaCardiovascular === "sim",
      hepatite: anamneseData.hepatite === "sim",
      problemas_respiratorios: anamneseData.problemasRespiratorios === "sim",
      gastrite_ulcera: anamneseData.gastriteUlcera === "sim",
      alteracoes_neurologicas: anamneseData.alteracoesNeurologicas === "sim",
      condicao_psicologica: anamneseData.condicaoPsicologica === "sim",
      hiv: anamneseData.hiv === "sim",
      historico_doencas_familiares: anamneseData.historicoDoencasFamiliares === "sim",
      tratamento_cancer: anamneseData.tratamentoCancer === "sim",
      fumante: anamneseData.fumante === "sim",
      drogas: anamneseData.drogas === "sim",
      anestesia_odontologica: anamneseData.anestesiaOdontologica === "sim",
      trauma_face: anamneseData.traumaFace === "sim",
      outras_doencas: anamneseData.outrasDoencas === "sim",

      // Campos de texto
      motivo_tratamento: anamneseData.motivoTratamento || null,
      nome_medico: anamneseData.nomeMedico || null,
      quais_medicamentos: anamneseData.quaisMedicamentos || null,
      motivo_hospitalizacao: anamneseData.motivoHospitalizacao || null,
      periodo_gestacional: anamneseData.periodoGestacional || null,
      qual_dieta: anamneseData.qualDieta || null,
      medicamento_emagrecer: anamneseData.medicamentoEmagrecer || null,
      qual_alergia: anamneseData.qualAlergia || null,
      qual_alteracao_coagulacao: anamneseData.qualAlteracaoCoagulacao || null,
      qual_doenca_autoimune: anamneseData.qualDoencaAutoimune || null,
      qual_doenca_renal_hepatica: anamneseData.qualDoencaRenalHepatica || null,
      tipo_diabetes: anamneseData.tipoDiabetes || null,
      qual_doenca_cardiovascular: anamneseData.qualDoencaCardiovascular || null,
      tipo_hepatite: anamneseData.tipoHepatite || null,
      pressao_arterial: anamneseData.pressaoArterial || "normal",
      quais_problemas_respiratorios: anamneseData.quaisProblemasRespiratorios || null,
      qual_alteracao_neurologica: anamneseData.qualAlteracaoNeurologica || null,
      qual_condicao_psicologica: anamneseData.qualCondicaoPsicologica || null,
      quais_doencas_familiares: anamneseData.quaisDoencasFamiliares || null,
      quantos_cigarros: anamneseData.quantosCigarros || null,
      quais_drogas: anamneseData.quaisDrogas || null,
      reacao_anestesia: anamneseData.reacaoAnestesia || null,
      quais_outras_doencas: anamneseData.quaisOutrasDoencas || null,
      motivo_consulta: anamneseData.motivoConsulta || null,
      como_conheceu: anamneseData.comoConheceu || null,

      // Assinatura e metadados
      assinatura: anamneseData.assinatura || null,
      ip_address: ip,
      created_at: new Date().toISOString(),
    }

    // Inserir dados na tabela anamnese
    const { data, error } = await supabase.from("anamnese").insert(insertData).select()

    if (error) {
      console.error("Erro detalhado ao inserir dados no Supabase:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao salvar a anamnese: " + error.message,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Dados salvos com sucesso:", data)

    // Retornar uma resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Anamnese enviada com sucesso",
      data: data,
    })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)

    // Retornar uma resposta de erro
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
        details: error,
      },
      { status: 500 },
    )
  }
}
