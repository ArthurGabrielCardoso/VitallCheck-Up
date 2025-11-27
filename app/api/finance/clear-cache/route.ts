import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/"

    // Revalidar o caminho especificado
    revalidatePath(path)

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        revalidated: false,
        now: Date.now(),
        error: error.message,
      },
      { status: 500 },
    )
  }
}
