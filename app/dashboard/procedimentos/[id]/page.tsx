"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AddMaterialToProcedimento from "../components/add-material-to-procedimento"
import ProcedimentoMaterialList from "../components/procedimento-material-list"
import type { Procedimento, ProcedimentoMaterial } from "@/lib/supabase"

interface ProcedimentoDetailPageProps {
  params: {
    id: string
  }
}

export default function ProcedimentoDetailPage({ params }: ProcedimentoDetailPageProps) {
  const [procedimento, setProcedimento] = useState<Procedimento | null>(null)
  const [materiais, setMateriais] = useState<ProcedimentoMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const procedimentoId = Number.parseInt(params.id)

  useEffect(() => {
    const fetchProcedimentoDetails = async () => {
      try {
        const response = await fetch(`/api/procedimentos/${procedimentoId}`)
        if (!response.ok) {
          throw new Error("Falha ao carregar detalhes do procedimento")
        }
        const data = await response.json()
        setProcedimento(data.procedimento)
        setMateriais(data.materiais)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    if (procedimentoId) {
      fetchProcedimentoDetails()
    }
  }, [procedimentoId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <p className="text-red-500">{error}</p>
          <Link href="/dashboard/procedimentos" className="text-primary hover:underline mt-4 inline-block">
            Voltar para Procedimentos
          </Link>
        </div>
      </div>
    )
  }

  if (!procedimento) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Procedimento não encontrado.</p>
          <Link href="/dashboard/procedimentos" className="text-primary hover:underline mt-4 inline-block">
            Voltar para Procedimentos
          </Link>
        </div>
      </div>
    )
  }

  // Calcular o valor total do procedimento
  const valorTotal = materiais.reduce((total, item) => {
    if (item.material) {
      return total + item.quantidade * item.material.valor_fracionado
    }
    return total
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/dashboard/procedimentos" className="text-primary hover:underline mr-4">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold">Detalhes do Procedimento</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">{procedimento.nome}</h2>

          <ProcedimentoMaterialList materiais={materiais} procedimentoId={procedimentoId} />

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-lg font-medium">
              Valor Total do Procedimento: <span className="text-primary">R$ {valorTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <AddMaterialToProcedimento procedimentoId={procedimentoId} />
      </div>
    </div>
  )
}
