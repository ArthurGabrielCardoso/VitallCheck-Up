"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Procedimento } from "@/lib/supabase"

interface ProcedimentoCardProps {
  procedimento: Procedimento
}

export default function ProcedimentoCard({ procedimento }: ProcedimentoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o procedimento "${procedimento.nome}"?`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/procedimentos/${procedimento.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao excluir procedimento")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium">{procedimento.nome}</h3>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="flex space-x-2">
        <Link
          href={`/dashboard/procedimentos/${procedimento.id}`}
          className="text-primary hover:text-primary/80 text-sm px-3 py-1 border border-primary rounded-md"
        >
          Ver Detalhes
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-500 rounded-md disabled:opacity-50"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </div>
  )
}
