import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// PATCH - Update a survey response
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Validate the ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: "ID inválido" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Update the survey response
    const { error } = await supabase.from("survey_responses").update(data).eq("id", id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating survey response:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete a survey response
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate the ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ success: false, message: "ID inválido" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Delete the survey response
    const { error } = await supabase.from("survey_responses").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting survey response:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
