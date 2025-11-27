"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddMaterialForm() {
  const [formData, setFormData] = useState({
    nome: "",
    valor_embalagem: "",
    qtde_embalagem: "",
    rendimento: "",
    valor_fracionado: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        valor_embalagem: Number.parseFloat(formData.valor_embalagem),
        valor_fracionado: Number.parseFloat(formData.valor_fracionado),
      }

      const response = await fetch("/api/materiais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao criar material")
      }

      setFormData({
        nome: "",
        valor_embalagem: "",
        qtde_embalagem: "",
        rendimento: "",
        valor_fracionado: "",
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-medium mb-4">Adicionar Novo Material</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Material
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="valor_embalagem" className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Embalagem (R$)
            </label>
            <input
              type="number"
              id="valor_embalagem"
              name="valor_embalagem"
              value={formData.valor_embalagem}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="qtde_embalagem" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade na Embalagem
            </label>
            <input
              type="text"
              id="qtde_embalagem"
              name="qtde_embalagem"
              value={formData.qtde_embalagem}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="rendimento" className="block text-sm font-medium text-gray-700 mb-1">
              Rendimento
            </label>
            <input
              type="text"
              id="rendimento"
              name="rendimento"
              value={formData.rendimento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="valor_fracionado" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Fracionado (R$)
            </label>
            <input
              type="number"
              id="valor_fracionado"
              name="valor_fracionado"
              value={formData.valor_fracionado}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Adicionando..." : "Adicionar Material"}
        </button>
      </form>
    </div>
  )
}
