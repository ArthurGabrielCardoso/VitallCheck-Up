"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Plus, Trash2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MaterialDropdown } from "./material-dropdown"
import type { Procedimento, ProcedimentoMaterial, Material } from "@/lib/supabase"

// Valor da hora clínica
const VALOR_HORA_CLINICA = 151.94

export function ProcedimentosTable() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [filteredProcedimentos, setFilteredProcedimentos] = useState<Procedimento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [materiais, setMateriais] = useState<Material[]>([])
  const [materiaisPorProcedimento, setMateriaisPorProcedimento] = useState<Record<number, ProcedimentoMaterial[]>>({})
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMateriais, setIsFetchingMateriais] = useState(false)
  const [isAddingMaterial, setIsAddingMaterial] = useState<Record<number, boolean>>({})
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [quantidade, setQuantidade] = useState<string>("1")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Valores padrão para laboratório, HR, comissão e lucro
  const [laboratorioValues, setLaboratorioValues] = useState<Record<number, number>>({})
  const [hrValues, setHrValues] = useState<Record<number, number>>({})
  const [comissaoPercent] = useState<number>(30) // 30% fixo como solicitado
  const [lucroPercent, setLucroPercent] = useState<Record<number, number>>({})

  const { toast } = useToast()

  useEffect(() => {
    fetchProcedimentos()
    fetchAllMateriais() // Carrega materiais ao iniciar o componente
  }, [])

  // Efeito para filtrar procedimentos quando o termo de pesquisa muda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProcedimentos(procedimentos)
      return
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim()
    const filtered = procedimentos.filter(
      (proc) =>
        proc.nome.toLowerCase().includes(lowerSearchTerm) ||
        (proc.codigo && proc.codigo.toLowerCase().includes(lowerSearchTerm)),
    )
    setFilteredProcedimentos(filtered)
  }, [searchTerm, procedimentos])

  const fetchProcedimentos = async () => {
    try {
      const response = await fetch("/api/procedimentos")
      if (!response.ok) {
        throw new Error("Erro ao buscar procedimentos")
      }
      const data = await response.json()
      setProcedimentos(data)
      setFilteredProcedimentos(data) // Inicializa os procedimentos filtrados com todos os procedimentos

      // Inicializar valores padrão
      const labValues: Record<number, number> = {}
      const hrVals: Record<number, number> = {}
      const lucroVals: Record<number, number> = {}

      data.forEach((proc: Procedimento) => {
        labValues[proc.id] = 0 // Valor padrão para laboratório
        hrVals[proc.id] = 1 // Valor padrão para HR
        lucroVals[proc.id] = 20 // Valor padrão para lucro (20%)
      })

      setLaboratorioValues(labValues)
      setHrValues(hrVals)
      setLucroPercent(lucroVals)
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de procedimentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllMateriais = async () => {
    try {
      setIsFetchingMateriais(true)
      console.log("Buscando materiais...")

      const response = await fetch("/api/materiais")
      if (!response.ok) {
        throw new Error("Erro ao buscar materiais")
      }

      const data = await response.json()
      console.log(`Materiais carregados: ${data.length}`, data)

      if (Array.isArray(data) && data.length > 0) {
        setMateriais(data)
      } else {
        console.warn("Lista de materiais vazia ou em formato inválido:", data)
        toast({
          title: "Aviso",
          description: "Nenhum material encontrado no banco de dados",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de materiais",
        variant: "destructive",
      })
    } finally {
      setIsFetchingMateriais(false)
    }
  }

  const fetchMateriaisProcedimento = async (procedimentoId: number) => {
    try {
      const response = await fetch(`/api/procedimento-material?procedimento_id=${procedimentoId}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar materiais do procedimento")
      }
      const data = await response.json()
      setMateriaisPorProcedimento((prev) => ({
        ...prev,
        [procedimentoId]: data,
      }))
    } catch (error) {
      console.error("Erro ao buscar materiais do procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais do procedimento",
        variant: "destructive",
      })
    }
  }

  const toggleRow = (procedimentoId: number) => {
    const isExpanded = !!expandedRows[procedimentoId]

    setExpandedRows((prev) => ({
      ...prev,
      [procedimentoId]: !isExpanded,
    }))

    if (!isExpanded && !materiaisPorProcedimento[procedimentoId]) {
      fetchMateriaisProcedimento(procedimentoId)
    }
  }

  const toggleAddMaterial = (procedimentoId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    // Se estamos abrindo o formulário, garantimos que a lista de materiais está carregada
    if (!isAddingMaterial[procedimentoId] && materiais.length === 0) {
      fetchAllMateriais()
    }

    setIsAddingMaterial((prev) => ({
      ...prev,
      [procedimentoId]: !prev[procedimentoId],
    }))

    // Resetar o formulário
    setSelectedMaterialId("")
    setQuantidade("1")
  }

  const handleAddMaterial = async (procedimentoId: number, event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedMaterialId || !quantidade) {
      toast({
        title: "Erro",
        description: "Selecione um material e informe a quantidade",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/procedimento-material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          procedimento_id: procedimentoId,
          material_id: Number.parseInt(selectedMaterialId),
          quantidade: Number.parseFloat(quantidade),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao adicionar material ao procedimento")
      }

      toast({
        title: "Sucesso",
        description: "Material adicionado ao procedimento com sucesso",
      })

      // Atualizar a lista de materiais
      fetchMateriaisProcedimento(procedimentoId)

      // Fechar o formulário
      toggleAddMaterial(procedimentoId)
    } catch (error) {
      console.error("Erro ao adicionar material ao procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o material ao procedimento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMaterial = async (procedimentoId: number, materialId: number, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!confirm("Tem certeza que deseja remover este material do procedimento?")) {
      return
    }

    try {
      const response = await fetch(`/api/procedimento-material/${materialId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao remover material do procedimento")
      }

      toast({
        title: "Sucesso",
        description: "Material removido do procedimento com sucesso",
      })

      // Atualizar a lista de materiais
      fetchMateriaisProcedimento(procedimentoId)
    } catch (error) {
      console.error("Erro ao remover material do procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o material do procedimento",
        variant: "destructive",
      })
    }
  }

  const handleLaboratorioChange = (procedimentoId: number, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setLaboratorioValues((prev) => ({
      ...prev,
      [procedimentoId]: numValue,
    }))
  }

  const handleHrChange = (procedimentoId: number, value: string) => {
    const numValue = Number.parseFloat(value) || 1
    setHrValues((prev) => ({
      ...prev,
      [procedimentoId]: numValue,
    }))
  }

  const handleLucroChange = (procedimentoId: number, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setLucroPercent((prev) => ({
      ...prev,
      [procedimentoId]: numValue,
    }))
  }

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value}%`
  }

  // Cálculo do novo valor com base na fórmula
  const calcularNovoValor = (
    custoMateriais: number,
    laboratorio: number,
    hr: number,
    comissao: number,
    lucro: number,
  ) => {
    // Custo da hora clínica baseado no HR
    const custoHoraClinica = VALOR_HORA_CLINICA * hr

    // Custos totais (materiais + laboratório + hora clínica)
    const custosTotais = custoMateriais + laboratorio + custoHoraClinica

    const percentualTotal = (comissao + lucro) / 100

    if (percentualTotal >= 1) return 0 // Evitar divisão por zero ou negativo

    return custosTotais / (1 - percentualTotal)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Campo de pesquisa */}
      <div className="relative">
        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden">
          <div className="pl-3 text-gray-400">
            <Search size={18} />
          </div>
          <Input
            type="text"
            placeholder="Pesquisar procedimentos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Limpar pesquisa"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Resultados da pesquisa */}
      {searchTerm && (
        <div className="text-sm text-gray-500 pb-2">
          {filteredProcedimentos.length === 0
            ? "Nenhum procedimento encontrado"
            : `Encontrados ${filteredProcedimentos.length} procedimentos`}
        </div>
      )}

      {/* Tabela de procedimentos */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-primary text-white p-3 text-left">Procedimento</th>
              <th className="bg-primary text-white p-3 text-center">HR</th>
              <th className="bg-primary text-white p-3 text-right">Material</th>
              <th className="bg-primary text-white p-3 text-right">Laboratório</th>
              <th className="bg-primary text-white p-3 text-center">30%</th>
              <th className="bg-primary text-white p-3 text-center">Lucro</th>
              <th className="bg-primary text-white p-3 text-right">Valor Atual</th>
              <th className="bg-primary text-white p-3 text-right">Valor Novo</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcedimentos.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  {searchTerm ? "Nenhum procedimento encontrado com esse termo" : "Nenhum procedimento cadastrado"}
                </td>
              </tr>
            ) : (
              filteredProcedimentos.map((procedimento, index) => {
                const isEven = index % 2 === 0
                const isExpanded = !!expandedRows[procedimento.id]
                const isAdding = !!isAddingMaterial[procedimento.id]
                const materiais = materiaisPorProcedimento[procedimento.id] || []

                // Valores para cálculos
                const laboratorio = laboratorioValues[procedimento.id] || 0
                const hr = hrValues[procedimento.id] || 1
                const lucro = lucroPercent[procedimento.id] || 20

                // Calcular o custo total dos materiais
                const custoMateriais = materiais.reduce((total, item) => {
                  if (item.material) {
                    return total + item.material.valor_fracionado * item.quantidade
                  }
                  return total
                }, 0)

                // Calcular o novo valor
                const novoValor = calcularNovoValor(custoMateriais, laboratorio, hr, comissaoPercent, lucro)

                return (
                  <>
                    <tr
                      key={procedimento.id}
                      className={`cursor-pointer hover:bg-gray-100 ${isEven ? "bg-primary/10" : "bg-white"}`}
                      onClick={() => toggleRow(procedimento.id)}
                    >
                      <td className="p-3 border-b">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                          )}
                          <span className="font-medium">
                            {procedimento.nome}
                            {procedimento.codigo && (
                              <span className="text-xs text-gray-500 ml-2">({procedimento.codigo})</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border-b text-center">
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="w-16 h-8 text-center mx-auto"
                          value={hr}
                          onChange={(e) => handleHrChange(procedimento.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3 border-b text-right">{formatCurrency(custoMateriais)}</td>
                      <td className="p-3 border-b text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 h-8 text-right"
                          value={laboratorio}
                          onChange={(e) => handleLaboratorioChange(procedimento.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3 border-b text-center">{formatPercent(comissaoPercent)}</td>
                      <td className="p-3 border-b text-center">
                        <div className="flex items-center justify-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 h-8 text-center"
                            value={lucro}
                            onChange={(e) => handleLucroChange(procedimento.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </td>
                      <td className="p-3 border-b text-right">{formatCurrency(procedimento.valor || 0)}</td>
                      <td className="p-3 border-b text-right font-medium">
                        <span className={novoValor > (procedimento.valor || 0) ? "text-red-600" : "text-green-600"}>
                          {formatCurrency(novoValor)}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className={isEven ? "bg-primary/5" : "bg-gray-50"}>
                        <td colSpan={8} className="p-0">
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-semibold text-primary">Materiais utilizados:</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={(e) => toggleAddMaterial(procedimento.id, e)}
                              >
                                <Plus className="h-4 w-4" />
                                {isAdding ? "Cancelar" : "Adicionar Material"}
                              </Button>
                            </div>

                            {isAdding && (
                              <div className="mb-4 p-3 border rounded-md bg-white">
                                <form onSubmit={(e) => handleAddMaterial(procedimento.id, e)} className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label htmlFor={`material-${procedimento.id}`} className="text-xs">
                                        Material
                                      </Label>
                                      <MaterialDropdown
                                        value={selectedMaterialId}
                                        onChange={setSelectedMaterialId}
                                        procedimentoId={procedimento.id}
                                        disabled={isSubmitting}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`quantidade-${procedimento.id}`} className="text-xs">
                                        Quantidade
                                      </Label>
                                      <Input
                                        id={`quantidade-${procedimento.id}`}
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        placeholder="Quantidade"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={isSubmitting}
                                      className="flex items-center gap-1"
                                    >
                                      {isSubmitting ? "Adicionando..." : "Adicionar"}
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            )}

                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="bg-primary/20 p-2 text-left text-xs">Material</th>
                                  <th className="bg-primary/20 p-2 text-right text-xs">Quantidade</th>
                                  <th className="bg-primary/20 p-2 text-right text-xs">Valor Unitário</th>
                                  <th className="bg-primary/20 p-2 text-right text-xs">Valor Total</th>
                                  <th className="bg-primary/20 p-2 text-center text-xs w-16">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {materiais.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="p-2 text-center text-gray-500 text-sm">
                                      {isLoading ? (
                                        <div className="flex justify-center p-2">
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        </div>
                                      ) : (
                                        "Nenhum material associado a este procedimento"
                                      )}
                                    </td>
                                  </tr>
                                ) : (
                                  materiais.map((item) => (
                                    <tr key={item.id} className="text-sm">
                                      <td className="p-2 border-b border-gray-200">{item.material?.nome}</td>
                                      <td className="p-2 border-b border-gray-200 text-right">{item.quantidade}</td>
                                      <td className="p-2 border-b border-gray-200 text-right">
                                        {item.material ? formatCurrency(item.material.valor_fracionado) : "-"}
                                      </td>
                                      <td className="p-2 border-b border-gray-200 text-right">
                                        {item.material
                                          ? formatCurrency(item.material.valor_fracionado * item.quantidade)
                                          : "-"}
                                      </td>
                                      <td className="p-2 border-b border-gray-200 text-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                                          onClick={(e) => handleDeleteMaterial(procedimento.id, item.id, e)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span className="sr-only">Remover</span>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                                <tr className="font-medium">
                                  <td colSpan={3} className="p-2 text-right">
                                    Total:
                                  </td>
                                  <td className="p-2 text-right">{formatCurrency(custoMateriais)}</td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
