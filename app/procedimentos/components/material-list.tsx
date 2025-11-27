"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, Pencil } from "lucide-react"
import { AddMaterialForm } from "./add-material-form"
import { ImportMateriaisText } from "./import-materiais-text"
import { DeleteAllMateriaisButton } from "./delete-all-materiais-button"
import { EditMaterialForm } from "./edit-material-form"
import type { Material } from "@/lib/supabase"

export function MaterialList() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const { toast } = useToast()

  const fetchMateriais = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/materiais")

      if (response.status === 429) {
        setError("Muitas requisições. Aguarde um momento e tente novamente.")
        toast({
          title: "Limite de requisições excedido",
          description: "Aguarde um momento e tente novamente",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setMateriais(data)
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
      setError("Não foi possível carregar a lista de materiais")
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de materiais",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMateriais()
  }, [])

  // Restaurar a posição de rolagem após fechar o modal de edição
  useEffect(() => {
    if (!isEditModalOpen && tableRef.current && scrollPosition > 0) {
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollPosition
        }
      }, 100)
    }
  }, [isEditModalOpen, scrollPosition])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Aplicar desconto de 10% ao valor
  const applyDiscount = (value: number) => {
    return value * 0.9
  }

  const handleRefresh = () => {
    fetchMateriais()
  }

  const handleEditMaterial = (material: Material) => {
    // Salvar a posição de rolagem atual
    if (tableRef.current) {
      setScrollPosition(tableRef.current.scrollTop)
    }
    setEditingMaterial(material)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleEditSuccess = () => {
    fetchMateriais()
    setEditingMaterial(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lista">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lista">Lista de Materiais</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Material</TabsTrigger>
          <TabsTrigger value="importar">Importar Materiais</TabsTrigger>
          <TabsTrigger value="gerenciar">Gerenciar</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lista de Materiais</CardTitle>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-4">Valores com 10% de desconto</span>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    Tentar novamente
                  </Button>
                </div>
              ) : materiais.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum material cadastrado</p>
              ) : (
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto" ref={tableRef}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>
                          Valor Embalagem
                          <span className="text-xs text-muted-foreground ml-1">(com desconto)</span>
                        </TableHead>
                        <TableHead>Qtde. Embalagem</TableHead>
                        <TableHead>Rendimento</TableHead>
                        <TableHead>
                          Valor Fracionado
                          <span className="text-xs text-muted-foreground ml-1">(com desconto)</span>
                        </TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materiais.map((material, index) => (
                        <TableRow key={material.id} className={index % 2 === 0 ? "bg-white" : "bg-primary/5"}>
                          <TableCell className="font-medium">{material.nome}</TableCell>
                          <TableCell>{formatCurrency(applyDiscount(material.valor_embalagem))}</TableCell>
                          <TableCell>{material.qtde_embalagem}</TableCell>
                          <TableCell>{material.rendimento}</TableCell>
                          <TableCell>{formatCurrency(material.valor_fracionado)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMaterial(material)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adicionar">
          <AddMaterialForm onSuccess={fetchMateriais} />
        </TabsContent>

        <TabsContent value="importar">
          <ImportMateriaisText onSuccess={fetchMateriais} />
        </TabsContent>

        <TabsContent value="gerenciar">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Materiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Zona de Perigo</h3>
                <p className="text-red-600 mb-4">
                  As ações abaixo são irreversíveis e podem afetar o funcionamento do sistema. Use com cautela.
                </p>
                <DeleteAllMateriaisButton onSuccess={fetchMateriais} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditMaterialForm
        material={editingMaterial}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
