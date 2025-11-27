"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SurveyResponseCard } from "../components/survey-response-card"
import { ExportDataButton } from "../components/export-data-button"
import { createClientSupabaseClient, type SurveyResponse } from "@/lib/supabase"
import { Search, ArrowLeft, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ManageSurveyResponses() {
  const router = useRouter()
  const { toast } = useToast()
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [filterBy, setFilterBy] = useState<string>("all")

  const fetchResponses = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientSupabaseClient()

      let query = supabase.from("survey_responses").select("*")

      // Apply filters
      if (filterBy === "high_rating") {
        query = query.gte("clinical_rating", 4)
      } else if (filterBy === "low_rating") {
        query = query.lte("clinical_rating", 2)
      } else if (filterBy === "with_comments") {
        query = query.not("comments", "is", null)
      } else if (filterBy === "integrative_yes") {
        query = query.eq("integrative_interest", true)
      } else if (filterBy === "integrative_no") {
        query = query.eq("integrative_interest", false)
      }

      // Apply sorting
      if (sortBy === "newest") {
        query = query.order("submitted_at", { ascending: false })
      } else if (sortBy === "oldest") {
        query = query.order("submitted_at", { ascending: true })
      } else if (sortBy === "highest_rating") {
        query = query.order("clinical_rating", { ascending: false })
      } else if (sortBy === "lowest_rating") {
        query = query.order("clinical_rating", { ascending: true })
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      setResponses(data as SurveyResponse[])
    } catch (err) {
      console.error("Error fetching responses:", err)
      setError(err instanceof Error ? err.message : "Erro ao buscar respostas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
  }, [sortBy, filterBy])

  const handleUpdateResponse = async (id: number, updatedData: Partial<SurveyResponse>) => {
    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase.from("survey_responses").update(updatedData).eq("id", id)

      if (error) throw new Error(error.message)

      toast({
        title: "Resposta atualizada",
        description: "A resposta foi atualizada com sucesso.",
      })

      // Refresh the responses list
      fetchResponses()
    } catch (err) {
      console.error("Error updating response:", err)
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      })
      throw err
    }
  }

  const handleDeleteResponse = async (id: number) => {
    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase.from("survey_responses").delete().eq("id", id)

      if (error) throw new Error(error.message)

      toast({
        title: "Resposta excluída",
        description: "A resposta foi excluída com sucesso.",
      })

      // Update the local state to remove the deleted response
      setResponses(responses.filter((response) => response.id !== id))
    } catch (err) {
      console.error("Error deleting response:", err)
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      })
      throw err
    }
  }

  // Filter responses based on search term
  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      response.selected_dentist.toLowerCase().includes(searchLower) ||
      (response.comments && response.comments.toLowerCase().includes(searchLower)) ||
      (response.other_specialty && response.other_specialty.toLowerCase().includes(searchLower)) ||
      response.id.toString().includes(searchTerm)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-primary">Gerenciar Respostas da Pesquisa</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar por dentista, comentários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as respostas</SelectItem>
                <SelectItem value="high_rating">Avaliação alta (4-5)</SelectItem>
                <SelectItem value="low_rating">Avaliação baixa (1-2)</SelectItem>
                <SelectItem value="with_comments">Com comentários</SelectItem>
                <SelectItem value="integrative_yes">Interesse integrativa: Sim</SelectItem>
                <SelectItem value="integrative_no">Interesse integrativa: Não</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
                <SelectItem value="highest_rating">Maior avaliação</SelectItem>
                <SelectItem value="lowest_rating">Menor avaliação</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchResponses} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            {filteredResponses.length}{" "}
            {filteredResponses.length === 1 ? "resposta encontrada" : "respostas encontradas"}
          </div>
          <ExportDataButton />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Carregando respostas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">Erro ao carregar respostas: {error}</p>
              <Button variant="outline" size="sm" onClick={fetchResponses} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma resposta encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResponses.map((response) => (
            <SurveyResponseCard
              key={response.id}
              response={response}
              onUpdate={handleUpdateResponse}
              onDelete={handleDeleteResponse}
            />
          ))}
        </div>
      )}
    </div>
  )
}
