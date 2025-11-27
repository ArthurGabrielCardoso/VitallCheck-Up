"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddProcedimentoForm() {
  const [nome, setNome] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/procedimentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao criar procedimento")
      }

      setNome("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-medium mb-4">Adicionar Novo Procedimento</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Procedimento
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Adicionando..." : "Adicionar Procedimento"}
        </button>
      </form>
    </div>
  )
}
