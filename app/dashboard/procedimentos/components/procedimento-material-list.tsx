"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ProcedimentoMaterial } from "@/lib/supabase"

interface ProcedimentoMaterialListProps {
  materiais: ProcedimentoMaterial[]
  procedimentoId: number
}

export default function ProcedimentoMaterialList({ materiais, procedimentoId }: ProcedimentoMaterialListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este material do procedimento?")) {
      return
    }

    setIsDeleting(id)
    setError(null)

    try {
      const response = await fetch(`/api/procedimento-material/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao remover material do procedimento")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setIsDeleting(null)
    }
  }

  if (materiais.length === 0) {
    return <p className="text-gray-500 mt-2">Nenhum material associado a este procedimento.</p>
  }

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Materiais Utilizados</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Material</th>
              <th className="py-2 px-4 border-b text-left">Quantidade</th>
              <th className="py-2 px-4 border-b text-left">Valor Fracionado</th>
              <th className="py-2 px-4 border-b text-left">Valor Total</th>
              <th className="py-2 px-4 border-b text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiais.map((item) => {
              const material = item.material
              const valorTotal = material ? item.quantidade * material.valor_fracionado : 0

              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{material?.nome || "Material não encontrado"}</td>
                  <td className="py-2 px-4">{item.quantidade}</td>
                  <td className="py-2 px-4">{material ? `R$ ${material.valor_fracionado.toFixed(2)}` : "N/A"}</td>
                  <td className="py-2 px-4">R$ {valorTotal.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                    >
                      {isDeleting === item.id ? "Removendo..." : "Remover"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
