"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MaterialList from "./material-list"

interface AddMaterialToProcedimentoProps {
  procedimentoId: number
}

export default function AddMaterialToProcedimento({ procedimentoId }: AddMaterialToProcedimentoProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null)
  const [quantidade, setQuantidade] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleSelectMaterial = (materialId: number) => {
    setSelectedMaterialId(materialId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMaterialId) {
      setError("Selecione um material")
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch("/api/procedimento-material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          procedimento_id: procedimentoId,
          material_id: selectedMaterialId,
          quantidade: Number.parseFloat(quantidade),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao adicionar material ao procedimento")
      }

      setSelectedMaterialId(null)
      setQuantidade("")
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Adicionar Material ao Procedimento</h2>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Adicionar Novo Material
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <MaterialList onSelectMaterial={handleSelectMaterial} />

          {selectedMaterialId && (
            <div className="mt-4">
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                id="quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                step="0.01"
                min="0"
                className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              disabled={isAdding || !selectedMaterialId}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isAdding ? "Adicionando..." : "Adicionar Material"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
