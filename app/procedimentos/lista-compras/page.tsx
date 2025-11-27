"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "../components/page-header"
import { ShoppingCart, Trash2, Check, Sparkles, Package, AlertTriangle, Download, RefreshCw } from "lucide-react"
import type { ListaCompras } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ListaComprasPage() {
  const [items, setItems] = useState<ListaCompras[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lista-compras")
      if (!response.ok) throw new Error("Erro ao buscar lista")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de compras",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAutoList = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/lista-compras/gerar-automatica", { method: "POST" })
      if (!response.ok) throw new Error("Erro ao gerar lista")
      const result = await response.json()
      toast({
        title: "Sucesso",
        description: result.message,
      })
      fetchItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a lista automática",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateItemStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/lista-compras/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar")
      toast({ title: "Sucesso", description: "Status atualizado" })
      fetchItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      })
    }
  }

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/lista-compras/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erro ao remover")
      toast({ title: "Sucesso", description: "Item removido" })
      fetchItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
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

  const exportList = () => {
    const pendingItems = items.filter((i) => i.status === "pendente" || i.status === "aprovado")
    const text = pendingItems
      .map(
        (item) =>
          `${item.material?.nome || "Material"} - Qtd: ${item.quantidade_sugerida} ${item.material?.unidade_medida || "un"} - ${getPrioridadeLabel(item.prioridade)}`,
      )
      .join("\n")

    const blob = new Blob([`LISTA DE COMPRAS - ${new Date().toLocaleDateString("pt-BR")}\n\n${text}`], {
      type: "text/plain",
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lista-compras-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getPrioridadeLabel = (prioridade: string) => {
    const labels: Record<string, string> = {
      baixa: "Baixa",
      normal: "Normal",
      alta: "Alta",
      urgente: "Urgente",
    }
    return labels[prioridade] || prioridade
  }

  const getPrioridadeColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      baixa: "bg-gray-100 text-gray-700",
      normal: "bg-blue-100 text-blue-700",
      alta: "bg-amber-100 text-amber-700",
      urgente: "bg-red-100 text-red-700",
    }
    return colors[prioridade] || colors.normal
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-700",
      aprovado: "bg-blue-100 text-blue-700",
      comprado: "bg-green-100 text-green-700",
      cancelado: "bg-gray-100 text-gray-500",
    }
    return colors[status] || colors.pendente
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const pendingCount = items.filter((i) => i.status === "pendente").length
  const urgenteCount = items.filter((i) => i.prioridade === "urgente" && i.status !== "comprado").length
  const valorTotal = items
    .filter((i) => i.status !== "comprado" && i.status !== "cancelado")
    .reduce(
      (sum, item) =>
        sum +
        (item.material?.valor_embalagem || 0) *
          Math.ceil(item.quantidade_sugerida / (Number.parseFloat(item.material?.qtde_embalagem || "1") || 1)),
      0,
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Lista de Compras"
        description="Gerencie os materiais que precisam ser comprados"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportList} className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={generateAutoList} disabled={isGenerating} className="gap-2">
              {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Gerar Automática
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Itens</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={urgenteCount > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{urgenteCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Estimado</p>
                <p className="text-2xl font-bold">{formatCurrency(valorTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Itens para Compra
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-2">Lista vazia</p>
              <p className="text-sm mb-4">Clique em "Gerar Automática" para adicionar itens baseados no estoque</p>
              <Button onClick={generateAutoList} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Lista Automática
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Prioridade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Valor Est.</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const embalagensNecessarias = Math.ceil(
                      item.quantidade_sugerida / (Number.parseFloat(item.material?.qtde_embalagem || "1") || 1),
                    )
                    const valorEstimado = (item.material?.valor_embalagem || 0) * embalagensNecessarias

                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "animate-slide-in transition-colors",
                          item.status === "comprado" && "opacity-50",
                          item.status === "cancelado" && "opacity-30",
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.material?.nome || "Material não encontrado"}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.material?.fornecedor || "Sem fornecedor"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono font-medium">
                            {item.quantidade_sugerida} {item.material?.unidade_medida || "un"}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            ({embalagensNecessarias} embalagem{embalagensNecessarias > 1 ? "s" : ""})
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getPrioridadeColor(item.prioridade)}>
                            {getPrioridadeLabel(item.prioridade)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(valorEstimado)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {item.status === "pendente" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateItemStatus(item.id, "comprado")}
                                title="Marcar como comprado"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteItem(item.id)}
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </div>
  )
}
