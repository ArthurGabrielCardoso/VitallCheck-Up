"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "../components/page-header"
import { EstoqueBadge } from "../components/status-badge"
import { Search, Plus, AlertTriangle, Package, Calendar, Edit2, Save, ShoppingCart } from "lucide-react"
import type { Material } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [filteredMateriais, setFilteredMateriais] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "ok" | "baixo" | "critico" | "vencendo">("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    valor_embalagem: "",
    qtde_embalagem: "",
    rendimento: "",
    valor_fracionado: "",
    quantidade_estoque: "",
    quantidade_minima: "",
    unidade_medida: "un",
    fornecedor: "",
    data_validade: "",
  })

  useEffect(() => {
    fetchMateriais()
  }, [])

  useEffect(() => {
    filterMateriais()
  }, [searchTerm, statusFilter, materiais])

  const fetchMateriais = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/materiais")
      if (!response.ok) throw new Error("Erro ao buscar materiais")

      const data = await response.json()
      setMateriais(data)
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterMateriais = () => {
    let filtered = materiais

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter((mat) => mat.nome.toLowerCase().includes(lowerSearch))
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((mat) => {
        const estoque = mat.quantidade_estoque || 0
        const minimo = mat.quantidade_minima || 0
        const percentual = minimo > 0 ? (estoque / minimo) * 100 : 100

        if (statusFilter === "vencendo") {
          if (!mat.data_validade) return false
          const validade = new Date(mat.data_validade)
          const hoje = new Date()
          const diasParaVencer = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
          return diasParaVencer <= 30 && diasParaVencer > 0
        }

        if (statusFilter === "ok") return percentual >= 100
        if (statusFilter === "baixo") return percentual >= 50 && percentual < 100
        if (statusFilter === "critico") return percentual < 50
        return true
      })
    }

    setFilteredMateriais(filtered)
  }

  const getStatusCount = (status: "ok" | "baixo" | "critico" | "vencendo") => {
    return materiais.filter((mat) => {
      const estoque = mat.quantidade_estoque || 0
      const minimo = mat.quantidade_minima || 0
      const percentual = minimo > 0 ? (estoque / minimo) * 100 : 100

      if (status === "vencendo") {
        if (!mat.data_validade) return false
        const validade = new Date(mat.data_validade)
        const hoje = new Date()
        const diasParaVencer = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        return diasParaVencer <= 30 && diasParaVencer > 0
      }

      if (status === "ok") return percentual >= 100
      if (status === "baixo") return percentual >= 50 && percentual < 100
      if (status === "critico") return percentual < 50
      return false
    }).length
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getDiasParaVencer = (dateString: string | undefined) => {
    if (!dateString) return null
    const validade = new Date(dateString)
    const hoje = new Date()
    return Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      valor_embalagem: "",
      qtde_embalagem: "",
      rendimento: "",
      valor_fracionado: "",
      quantidade_estoque: "",
      quantidade_minima: "",
      unidade_medida: "un",
      fornecedor: "",
      data_validade: "",
    })
  }

  const openEditModal = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      nome: material.nome,
      valor_embalagem: material.valor_embalagem?.toString() || "",
      qtde_embalagem: material.qtde_embalagem || "",
      rendimento: material.rendimento || "",
      valor_fracionado: material.valor_fracionado?.toString() || "",
      quantidade_estoque: material.quantidade_estoque?.toString() || "",
      quantidade_minima: material.quantidade_minima?.toString() || "",
      unidade_medida: material.unidade_medida || "un",
      fornecedor: material.fornecedor || "",
      data_validade: material.data_validade || "",
    })
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Nome do material é obrigatório", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        nome: formData.nome,
        valor_embalagem: Number.parseFloat(formData.valor_embalagem) || 0,
        qtde_embalagem: formData.qtde_embalagem,
        rendimento: formData.rendimento,
        valor_fracionado: Number.parseFloat(formData.valor_fracionado) || 0,
        quantidade_estoque: Number.parseFloat(formData.quantidade_estoque) || 0,
        quantidade_minima: Number.parseFloat(formData.quantidade_minima) || 0,
        unidade_medida: formData.unidade_medida,
        fornecedor: formData.fornecedor,
        data_validade: formData.data_validade || null,
      }

      const url = editingMaterial ? `/api/materiais/${editingMaterial.id}` : "/api/materiais"

      const method = editingMaterial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Erro ao salvar material")

      toast({
        title: "Sucesso",
        description: editingMaterial ? "Material atualizado" : "Material adicionado",
      })

      resetForm()
      setIsAddingMaterial(false)
      setEditingMaterial(null)
      fetchMateriais()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o material",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToShoppingList = async (material: Material) => {
    try {
      const response = await fetch("/api/lista-compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_id: material.id,
          quantidade_sugerida: (material.quantidade_minima || 10) - (material.quantidade_estoque || 0),
          prioridade:
            (material.quantidade_estoque || 0) < (material.quantidade_minima || 10) * 0.5 ? "urgente" : "normal",
        }),
      })

      if (!response.ok) throw new Error("Erro ao adicionar")

      toast({
        title: "Sucesso",
        description: `${material.nome} adicionado à lista de compras`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar à lista",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const materiaisCriticos = getStatusCount("critico")
  const materiaisBaixos = getStatusCount("baixo")
  const materiaisVencendo = getStatusCount("vencendo")

  // Calcular valor total do estoque
  const valorTotalEstoque = materiais.reduce((sum, m) => {
    return sum + (m.valor_fracionado || 0) * (m.quantidade_estoque || 0)
  }, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Controle de Estoque"
        description="Gerencie o estoque de materiais odontológicos"
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              resetForm()
              setIsAddingMaterial(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Material
          </Button>
        }
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Materiais</p>
                <p className="text-2xl font-bold">{materiais.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">{formatCurrency(valorTotalEstoque)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={materiaisCriticos > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{materiaisCriticos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={materiaisVencendo > 0 ? "border-amber-200 bg-amber-50/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencendo (30 dias)</p>
                <p className="text-2xl font-bold text-amber-600">{materiaisVencendo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label htmlFor="search" className="text-sm font-medium mb-2 block">
                Buscar material
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome do material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("todos")}
              >
                Todos ({materiais.length})
              </Button>
              <Button
                variant={statusFilter === "ok" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ok")}
                className={statusFilter === "ok" ? "" : "border-green-500 text-green-700 hover:bg-green-50"}
              >
                OK ({getStatusCount("ok")})
              </Button>
              <Button
                variant={statusFilter === "baixo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("baixo")}
                className={statusFilter === "baixo" ? "" : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"}
              >
                Baixo ({getStatusCount("baixo")})
              </Button>
              <Button
                variant={statusFilter === "critico" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("critico")}
                className={statusFilter === "critico" ? "" : "border-red-500 text-red-700 hover:bg-red-50"}
              >
                Crítico ({getStatusCount("critico")})
              </Button>
              <Button
                variant={statusFilter === "vencendo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("vencendo")}
                className={statusFilter === "vencendo" ? "" : "border-amber-500 text-amber-700 hover:bg-amber-50"}
              >
                Vencendo ({getStatusCount("vencendo")})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de materiais */}
      <Card>
        <CardContent className="p-0">
          {filteredMateriais.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhum material encontrado</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando um novo material"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Validade</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMateriais.map((material, index) => {
                    const estoque = material.quantidade_estoque || 0
                    const minimo = material.quantidade_minima || 10
                    const unidade = material.unidade_medida || "un"
                    const valorTotal = (material.valor_fracionado || 0) * estoque
                    const diasParaVencer = getDiasParaVencer(material.data_validade)
                    const precisaComprar = estoque <= minimo

                    return (
                      <TableRow
                        key={material.id}
                        className="animate-slide-in hover:bg-secondary/50 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <p>{material.nome}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {material.rendimento && <span>Rende: {material.rendimento}</span>}
                              {material.fornecedor && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{material.fornecedor}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono font-medium">
                            {estoque} {unidade}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono text-muted-foreground">
                            {minimo} {unidade}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <EstoqueBadge quantidadeAtual={estoque} quantidadeMinima={minimo} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(material.valor_fracionado)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-teal-600">
                          {formatCurrency(valorTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          {material.data_validade ? (
                            <div className={diasParaVencer && diasParaVencer <= 30 ? "text-amber-600 font-medium" : ""}>
                              <p>{formatDate(material.data_validade)}</p>
                              {diasParaVencer !== null && diasParaVencer <= 30 && (
                                <p className="text-xs">{diasParaVencer <= 0 ? "Vencido!" : `${diasParaVencer} dias`}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModal(material)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {precisaComprar && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleAddToShoppingList(material)}
                                title="Adicionar à lista de compras"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredMateriais.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Exibindo {filteredMateriais.length} de {materiais.length} materiais
        </div>
      )}

      {/* Modal de Adicionar/Editar Material */}
      <Dialog
        open={isAddingMaterial || editingMaterial !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingMaterial(false)
            setEditingMaterial(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? "Editar Material" : "Novo Material"}</DialogTitle>
            <DialogDescription>
              {editingMaterial ? "Atualize as informações do material" : "Preencha os dados do novo material"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome do Material *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Resina Composta A3"
              />
            </div>

            <div>
              <Label htmlFor="valor_embalagem">Valor Embalagem (R$)</Label>
              <Input
                id="valor_embalagem"
                type="number"
                step="0.01"
                value={formData.valor_embalagem}
                onChange={(e) => setFormData({ ...formData, valor_embalagem: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="qtde_embalagem">Qtde na Embalagem</Label>
              <Input
                id="qtde_embalagem"
                value={formData.qtde_embalagem}
                onChange={(e) => setFormData({ ...formData, qtde_embalagem: e.target.value })}
                placeholder="Ex: 4g, 10un, 1L"
              />
            </div>

            <div>
              <Label htmlFor="rendimento">Rendimento</Label>
              <Input
                id="rendimento"
                value={formData.rendimento}
                onChange={(e) => setFormData({ ...formData, rendimento: e.target.value })}
                placeholder="Ex: 20 aplicações"
              />
            </div>

            <div>
              <Label htmlFor="valor_fracionado">Valor Fracionado (R$)</Label>
              <Input
                id="valor_fracionado"
                type="number"
                step="0.01"
                value={formData.valor_fracionado}
                onChange={(e) => setFormData({ ...formData, valor_fracionado: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="quantidade_estoque">Estoque Atual</Label>
              <Input
                id="quantidade_estoque"
                type="number"
                value={formData.quantidade_estoque}
                onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="quantidade_minima">Estoque Mínimo</Label>
              <Input
                id="quantidade_minima"
                type="number"
                value={formData.quantidade_minima}
                onChange={(e) => setFormData({ ...formData, quantidade_minima: e.target.value })}
                placeholder="10"
              />
            </div>

            <div>
              <Label htmlFor="unidade_medida">Unidade de Medida</Label>
              <select
                id="unidade_medida"
                className="w-full h-10 px-3 border border-input rounded-md bg-background"
                value={formData.unidade_medida}
                onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
              >
                <option value="un">Unidade (un)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="g">Grama (g)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="L">Litro (L)</option>
                <option value="par">Par</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingMaterial(false)
                setEditingMaterial(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
