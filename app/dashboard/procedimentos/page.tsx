"use client"

import { useState, useEffect } from "react"
import AddProcedimentoForm from "./components/add-procedimento-form"
import AddMaterialForm from "./components/add-material-form"
import ProcedimentoCard from "./components/procedimento-card"
import type { Procedimento } from "@/lib/supabase"

export default function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"procedimentos" | "materiais">("procedimentos")

  useEffect(() => {
    const fetchProcedimentos = async () => {
      try {
        const response = await fetch("/api/procedimentos")
        if (!response.ok) {
          throw new Error("Falha ao carregar procedimentos")
        }
        const data = await response.json()
        setProcedimentos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProcedimentos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Procedimentos e Materiais</h1>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "procedimentos"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("procedimentos")}
            >
              Procedimentos
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "materiais"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("materiais")}
            >
              Materiais
            </button>
          </div>
        </div>

        {activeTab === "procedimentos" ? (
          <>
            <AddProcedimentoForm />

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Procedimentos Cadastrados</h2>

              {isLoading ? (
                <p className="text-gray-500">Carregando procedimentos...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : procedimentos.length === 0 ? (
                <p className="text-gray-500">Nenhum procedimento cadastrado.</p>
              ) : (
                <div>
                  {procedimentos.map((procedimento) => (
                    <ProcedimentoCard key={procedimento.id} procedimento={procedimento} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <AddMaterialForm />
        )}
      </div>
    </div>
  )
}
