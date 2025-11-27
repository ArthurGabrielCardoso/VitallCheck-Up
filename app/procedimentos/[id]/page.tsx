"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { EspecialidadeBadge } from "../components/especialidade-badge"
import { ArrowLeft, Save, Trash2, Plus, X, Package, Calculator } from "lucide-react"
import type { Procedimento, ProcedimentoMaterial } from "@/lib/supabase"
import { MaterialDropdown } from "../components/material-dropdown"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { getEspecialidades } from "../components/especialidade-badge"

const VALOR_HORA_CLINICA = 151.94
const COMISSAO_PERCENT = 30

export default function ProcedimentoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [procedimento, setProcedimento] = useState<Procedimento | null>(null)
  const [materiais, setMateriais] = useState<ProcedimentoMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form states
  const [nome, setNome] = useState("")
  const [codigo, setCodigo] = useState("")
  const [especialidade, setEspecialidade] = useState("")
  const [valor, setValor] = useState("")
  const [laboratorio, setLaboratorio] = useState("")
  const [hr, setHr] = useState("")
  const [lucroPercent, setLucroPercent] = useState("")

  // Add material state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState("")
  const [quantidade, setQuantidade] = useState("1")

  const procedimentoId = params?.id ? Number.parseInt(params.id as string) : null

  useEffect(() => {
    const token = localStorage.getItem("procedimentos-token")
    if (!token) {
      router.push("/procedimentos")
      return
    }

    if (procedimentoId) {
      fetchProcedimento()
      fetchMateriais()
    }
  }, [procedimentoId])

  const fetchProcedimento = async () => {
    if (!procedimentoId) return

    try {
      const response = await fetch(`/api/procedimentos/${procedimentoId}`)
      if (!response.ok) throw new Error("Erro ao buscar procedimento")

      const data = await response.json()
      setProcedimento(data)

      setNome(data.nome || "")
      setCodigo(data.codigo || "")
      setEspecialidade(data.especialidade || "Outros")
      setValor(data.valor?.toString() || "0")
      setLaboratorio(data.laboratorio?.toString() || "0")
      setHr(data.hr?.toString() || "1")
      setLucroPercent(data.lucro_percent?.toString() || "20")
    } catch (error) {
      console.error("Erro ao buscar procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o procedimento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMateriais = async () => {
    if (!procedimentoId) return

    try {
      const response = await fetch(`/api/procedimento-material?procedimento_id=${procedimentoId}`)
      if (!response.ok) throw new Error("Erro ao buscar materiais")

      const data = await response.json()
      setMateriais(data)
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
    }
  }

  const calcularCustoMateriais = () => {
    return materiais.reduce((total, item) => {
      if (item.material) {
        return total + item.material.valor_fracionado * item.quantidade
      }
      return total
    }, 0)
  }

  const calcularNovoValor = () => {
    const custoMateriais = calcularCustoMateriais()
    const lab = Number.parseFloat(laboratorio) || 0
    const hrVal = Number.parseFloat(hr) || 1
    const lucro = Number.parseFloat(lucroPercent) || 20

    const custoHoraClinica = VALOR_HORA_CLINICA * hrVal
    const custosTotais = custoMateriais + lab + custoHoraClinica
    const percentualTotal = (COMISSAO_PERCENT + lucro) / 100

    if (percentualTotal >= 1) return 0
    return custosTotais / (1 - percentualTotal)
  }

  const handleSave = async () => {
    if (!procedimentoId) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/procedimentos/${procedimentoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          codigo,
          especialidade,
          valor: Number.parseFloat(valor) || 0,
          laboratorio: Number.parseFloat(laboratorio) || 0,
          hr: Number.parseFloat(hr) || 1,
          lucro_percent: Number.parseFloat(lucroPercent) || 20,
        }),
      })

      if (!response.ok) throw new Error("Erro ao salvar procedimento")

      toast({
        title: "Sucesso",
        description: "Procedimento atualizado com sucesso",
      })

      fetchProcedimento()
    } catch (error) {
      console.error("Erro ao salvar procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o procedimento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!procedimentoId || !confirm("Tem certeza que deseja excluir este procedimento?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/procedimentos/${procedimentoId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao excluir procedimento")

      toast({
        title: "Sucesso",
        description: "Procedimento excluído com sucesso",
      })
      router.push("/procedimentos")
    } catch (error) {
      console.error("Erro ao excluir procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o procedimento",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMaterialId || !quantidade || !procedimentoId) {
      toast({
        title: "Erro",
        description: "Selecione um material e informe a quantidade",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/procedimento-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedimento_id: procedimentoId,
          material_id: Number.parseInt(selectedMaterialId),
          quantidade: Number.parseFloat(quantidade),
        }),
      })

      if (!response.ok) throw new Error("Erro ao adicionar material")

      toast({
        title: "Sucesso",
        description: "Material adicionado com sucesso",
      })

      fetchMateriais()
      setIsAddingMaterial(false)
      setSelectedMaterialId("")
      setQuantidade("1")
    } catch (error) {
      console.error("Erro ao adicionar material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o material",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMaterial = async (materialId: number) => {
    if (!confirm("Deseja remover este material?")) return

    try {
      const response = await fetch(`/api/procedimento-material/${materialId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao remover material")

      toast({
        title: "Sucesso",
        description: "Material removido com sucesso",
      })

      fetchMateriais()
    } catch (error) {
      console.error("Erro ao remover material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o material",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!procedimento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Procedimento não encontrado</p>
        <Button onClick={() => router.push("/procedimentos")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  const custoMateriais = calcularCustoMateriais()
  const valorSugerido = calcularNovoValor()
  const lucroAtual = Number.parseFloat(lucroPercent) || 20

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-lg shadow-teal-500/5 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Info esquerda */}
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.push("/procedimentos")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="text-xl font-bold border-0 border-b-2 border-transparent focus:border-teal-500 rounded-none px-0 h-auto py-1 bg-transparent"
                    placeholder="Nome do procedimento"
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="text-sm text-gray-500 border-0 border-b border-transparent focus:border-teal-500 rounded-none px-0 h-auto py-0.5 bg-transparent w-32"
                    placeholder="Código"
                  />
                  <Select value={especialidade} onValueChange={setEspecialidade}>
                    <SelectTrigger className="w-auto h-8 border-0 bg-transparent">
                      <EspecialidadeBadge especialidade={especialidade} />
                    </SelectTrigger>
                    <SelectContent>
                      {getEspecialidades().map((esp) => (
                        <SelectItem key={esp} value={esp}>
                          {esp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ações direita */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materiais */}
        <Card className="border-0 shadow-lg shadow-teal-500/5 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg">Materiais</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                className={
                  isAddingMaterial
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-teal-600 to-teal-700 text-white"
                }
              >
                {isAddingMaterial ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAddingMaterial && (
              <form
                onSubmit={handleAddMaterial}
                className="space-y-3 p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-100"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Selecionar Material</Label>
                  <MaterialDropdown
                    value={selectedMaterialId}
                    onChange={setSelectedMaterialId}
                    procedimentoId={procedimentoId || 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Quantidade</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                  Adicionar Material
                </Button>
              </form>
            )}

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {materiais.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum material adicionado</p>
                </div>
              ) : (
                materiais.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{item.material?.nome || "Material"}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantidade}x {formatCurrency(item.material?.valor_fracionado || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-teal-600">
                        {formatCurrency((item.material?.valor_fracionado || 0) * item.quantidade)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMaterial(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Materiais</span>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                  {formatCurrency(custoMateriais)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precificação */}
        <Card className="border-0 shadow-lg shadow-teal-500/5 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50">
                <Calculator className="h-5 w-5 text-teal-600" />
              </div>
              <CardTitle className="text-lg">Precificação</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custos */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custos</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Material</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(custoMateriais)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Laboratório</p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={laboratorio}
                    onChange={(e) => setLaboratorio(e.target.value)}
                    className="h-7 border-0 bg-transparent p-0 font-semibold text-gray-800 focus:ring-0"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hora Clínica (HR)</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        className="h-7 w-16 border-0 bg-transparent p-0 font-semibold text-gray-800 focus:ring-0"
                      />
                      <span className="text-xs text-gray-400">× {formatCurrency(VALOR_HORA_CLINICA)}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(VALOR_HORA_CLINICA * (Number.parseFloat(hr) || 1))}
                  </p>
                </div>
              </div>
            </div>

            {/* Margens */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Margens</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Comissão (fixo)</p>
                  <p className="font-semibold text-gray-800">{COMISSAO_PERCENT}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Lucro</p>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={lucroPercent}
                      onChange={(e) => setLucroPercent(e.target.value)}
                      className="h-7 w-14 border-0 bg-transparent p-0 font-semibold text-gray-800 focus:ring-0"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores Finais */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço</h4>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Preço Atual</p>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="h-8 border-0 bg-transparent p-0 font-semibold text-lg text-gray-800 focus:ring-0"
                />
              </div>

              <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl text-white">
                <p className="text-xs text-teal-100 mb-1">Preço Sugerido</p>
                <p className="text-3xl font-bold">{formatCurrency(valorSugerido)}</p>
                <p className="text-xs text-teal-100 mt-2">
                  Margem de {lucroAtual}% + Comissão de {COMISSAO_PERCENT}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
