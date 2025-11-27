"use client"

import { useState, useEffect } from "react"
import type { Material } from "@/lib/supabase"

interface MaterialListProps {
  onSelectMaterial: (materialId: number) => void
}

export default function MaterialList({ onSelectMaterial }: MaterialListProps) {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        const response = await fetch("/api/materiais")
        if (!response.ok) {
          throw new Error("Falha ao carregar materiais")
        }
        const data = await response.json()
        setMateriais(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMateriais()
  }, [])

  if (isLoading) {
    return <p className="text-gray-500">Carregando materiais...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (materiais.length === 0) {
    return <p className="text-gray-500">Nenhum material cadastrado.</p>
  }

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Selecione um Material</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {materiais.map((material) => (
          <button
            key={material.id}
            onClick={() => onSelectMaterial(material.id)}
            className="text-left p-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <p className="font-medium">{material.nome}</p>
            <p className="text-sm text-gray-500">Valor fracionado: R$ {material.valor_fracionado.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
