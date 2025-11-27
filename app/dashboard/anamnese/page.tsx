"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Search, ArrowLeft, RefreshCw, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Anamnese {
  id: number
  nome: string
  email: string
  telefone: string
  created_at: string
  motivo_consulta: string
  assinatura: string
  [key: string]: any
}

export default function AnamneseList() {
  const router = useRouter()
  const { toast } = useToast()
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedAnamnese, setSelectedAnamnese] = useState<Anamnese | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const fetchAnamneses = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientSupabaseClient()

      let query = supabase.from("anamnese").select("*")

      // Apply sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true })
      } else if (sortBy === "name_asc") {
        query = query.order("nome", { ascending: true })
      } else if (sortBy === "name_desc") {
        query = query.order("nome", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      setAnamneses(data as Anamnese[])
    } catch (err) {
      console.error("Error fetching anamneses:", err)
      setError(err instanceof Error ? err.message : "Erro ao buscar anamneses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnamneses()
  }, [sortBy])

  const handleViewAnamnese = (anamnese: Anamnese) => {
    setSelectedAnamnese(anamnese)
    setIsViewDialogOpen(true)
  }

  // Filter anamneses based on search term
  const filteredAnamneses = anamneses.filter((anamnese) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      anamnese.nome.toLowerCase().includes(searchLower) ||
      anamnese.email.toLowerCase().includes(searchLower) ||
      anamnese.telefone.includes(searchTerm) ||
      anamnese.motivo_consulta?.toLowerCase().includes(searchLower)
    )
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Render boolean values as Sim/Não
  const renderBooleanValue = (value: boolean) => {
    return value ? "Sim" : "Não"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-primary">Anamneses Clínicas</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
                <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchAnamneses} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-2">
          {filteredAnamneses.length} {filteredAnamneses.length === 1 ? "anamnese encontrada" : "anamneses encontradas"}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Carregando anamneses...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">Erro ao carregar anamneses: {error}</p>
              <Button variant="outline" size="sm" onClick={fetchAnamneses} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      ) : filteredAnamneses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma anamnese encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnamneses.map((anamnese) => (
            <Card key={anamnese.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex justify-between items-start">
                  <span>{anamnese.nome}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAnamnese(anamnese)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalhes</span>
                  </Button>
                </CardTitle>
                <p className="text-sm text-gray-500">Enviado em: {formatDate(anamnese.created_at)}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Email:</span> {anamnese.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span> {anamnese.telefone}
                  </p>
                  <p>
                    <span className="font-medium">Motivo da consulta:</span> {anamnese.motivo_consulta || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Como nos conheceu:</span> {anamnese.como_conheceu || "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para visualizar detalhes da anamnese */}
      {selectedAnamnese && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Anamnese de {selectedAnamnese.nome}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-lg font-medium mb-3 text-primary">Dados Pessoais</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nome:</span> {selectedAnamnese.nome}
                  </p>
                  <p>
                    <span className="font-medium">Endereço:</span> {selectedAnamnese.endereco}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span> {selectedAnamnese.telefone}
                  </p>
                  <p>
                    <span className="font-medium">Telefone auxiliar:</span> {selectedAnamnese.telefone_auxiliar || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedAnamnese.email}
                  </p>
                  <p>
                    <span className="font-medium">Instagram:</span> {selectedAnamnese.instagram || "-"}
                  </p>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3 text-primary">Informações Gerais</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Motivo da consulta:</span> {selectedAnamnese.motivo_consulta || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Como nos conheceu:</span> {selectedAnamnese.como_conheceu || "-"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-primary">Histórico Médico</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Em tratamento médico:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.tratamento_medico)}
                    {selectedAnamnese.tratamento_medico && (
                      <span className="block ml-4 text-sm">
                        Motivo: {selectedAnamnese.motivo_tratamento || "-"}
                        <br />
                        Médico: {selectedAnamnese.nome_medico || "-"}
                      </span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Medicamento contínuo:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.medicamento_continuo)}
                    {selectedAnamnese.medicamento_continuo && (
                      <span className="block ml-4 text-sm">Quais: {selectedAnamnese.quais_medicamentos || "-"}</span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Hospitalizado:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.hospitalizado)}
                    {selectedAnamnese.hospitalizado && (
                      <span className="block ml-4 text-sm">
                        Motivo: {selectedAnamnese.motivo_hospitalizacao || "-"}
                      </span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Grávida:</span> {renderBooleanValue(selectedAnamnese.gravida)}
                    {selectedAnamnese.gravida && (
                      <span className="block ml-4 text-sm">Período: {selectedAnamnese.periodo_gestacional || "-"}</span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Dieta:</span> {renderBooleanValue(selectedAnamnese.dieta)}
                    {selectedAnamnese.dieta && (
                      <span className="block ml-4 text-sm">
                        Qual: {selectedAnamnese.qual_dieta || "-"}
                        <br />
                        Medicamento para emagrecer: {selectedAnamnese.medicamento_emagrecer || "-"}
                      </span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Alergia:</span> {renderBooleanValue(selectedAnamnese.alergia)}
                    {selectedAnamnese.alergia && (
                      <span className="block ml-4 text-sm">Qual: {selectedAnamnese.qual_alergia || "-"}</span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Alteração na coagulação:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.alteracao_coagulacao)}
                    {selectedAnamnese.alteracao_coagulacao && (
                      <span className="block ml-4 text-sm">
                        Qual: {selectedAnamnese.qual_alteracao_coagulacao || "-"}
                      </span>
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Febre reumática:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.febre_reumatica)}
                  </p>

                  <p>
                    <span className="font-medium">Doença autoimune:</span>{" "}
                    {renderBooleanValue(selectedAnamnese.doenca_autoimune)}
                    {selectedAnamnese.doenca_autoimune && (
                      <span className="block ml-4 text-sm">Qual: {selectedAnamnese.qual_doenca_autoimune || "-"}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3 text-primary">Assinatura</h3>
              {selectedAnamnese.assinatura ? (
                <div className="border rounded-md p-2 bg-gray-50">
                  <img
                    src={selectedAnamnese.assinatura || "/placeholder.svg"}
                    alt="Assinatura"
                    className="max-h-32 mx-auto"
                  />
                </div>
              ) : (
                <p className="text-gray-500">Assinatura não disponível</p>
              )}
            </div>

            <div className="mt-4 text-right">
              <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
