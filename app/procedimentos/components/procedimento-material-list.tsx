"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ProcedimentoMaterial } from "@/lib/supabase"

interface ProcedimentoMaterialListProps {
  procedimentoId: number
}

export function ProcedimentoMaterialList({ procedimentoId }: ProcedimentoMaterialListProps) {
  const [materiais, setMateriais] = useState<ProcedimentoMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const { toast } = useToast()

  const fetchMateriais = async () => {
    if (!procedimentoId) {
      console.error("ID do procedimento não fornecido")
      setIsLoading(false)
      return
    }

    try {
      console.log(`Buscando materiais para o procedimento ID: ${procedimentoId}`)
      const response = await fetch(`/api/procedimento-material?procedimento_id=${procedimentoId}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao buscar materiais do procedimento: ${errorText}`)
      }

      const data = await response.json()
      console.log("Materiais recebidos:", data)
      setMateriais(data)

      // Calcular valor total
      const total = data.reduce((acc: number, item: ProcedimentoMaterial) => {
        if (item.material) {
          return acc + item.material.valor_fracionado * item.quantidade
        }
        return acc
      }, 0)

      setTotalValue(total)
    } catch (error) {
      console.error("Erro ao buscar materiais do procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de materiais do procedimento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (procedimentoId) {
      fetchMateriais()
    }
  }, [procedimentoId])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/procedimento-material/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao remover material do procedimento")
      }

      toast({
        title: "Sucesso",
        description: "Material removido do procedimento com sucesso",
      })

      fetchMateriais()
    } catch (error) {
      console.error("Erro ao remover material do procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o material do procedimento",
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
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Materiais do Procedimento</CardTitle>
        <div className="text-lg font-bold">Total: {formatCurrency(totalValue)}</div>
      </CardHeader>
      <CardContent>
        {materiais.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum material associado a este procedimento</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Fracionado</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiais.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.material?.nome}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{item.material ? formatCurrency(item.material.valor_fracionado) : "-"}</TableCell>
                    <TableCell>
                      {item.material ? formatCurrency(item.material.valor_fracionado * item.quantidade) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
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
  )
}
