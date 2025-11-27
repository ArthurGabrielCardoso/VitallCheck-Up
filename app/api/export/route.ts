import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as XLSX from "xlsx"

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to convert boolean to "Sim"/"Não"
function formatBoolean(value: boolean): string {
  return value ? "Sim" : "Não"
}

// Helper function to format specialties array
function formatSpecialties(specialties: string[] | null): string {
  if (!specialties || specialties.length === 0) return ""
  return specialties.join(", ")
}

export async function GET(request: NextRequest) {
  try {
    // Get format from query params (csv or xlsx)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Fetch all survey responses
    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching survey responses: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, message: "No data available for export" }, { status: 404 })
    }

    // Format data for export
    const formattedData = data.map((response) => ({
      ID: response.id,
      "Data de Envio": formatDate(response.submitted_at),
      "Avaliação da Recepção": response.reception_rating,
      "Avaliação da Pontualidade": response.punctuality_rating,
      Dentista: response.selected_dentist,
      "Avaliação do Atendimento Clínico": response.clinical_rating,
      "Interesse em Saúde Integrativa": formatBoolean(response.integrative_interest),
      "Especialidades de Interesse": formatSpecialties(response.specialties),
      "Outra Especialidade": response.other_specialty || "",
      Comentários: response.comments || "",
      IP: response.ip_address || "",
    }))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Respostas da Pesquisa")

    // Generate file based on requested format
    let buffer: Buffer
    let contentType: string
    let filename: string

    if (format === "xlsx") {
      // Excel format
      buffer = Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }))
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      filename = "pesquisa-satisfacao.xlsx"
    } else {
      // CSV format (default)
      buffer = Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "csv" }))
      contentType = "text/csv"
      filename = "pesquisa-satisfacao.csv"
    }

    // Set response headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Content-Disposition", `attachment; filename=${filename}`)

    return new NextResponse(buffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error exporting survey data:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
