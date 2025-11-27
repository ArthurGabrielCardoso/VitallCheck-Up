"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setIsExporting(true)

      // Fazer a requisição para a API de exportação
      const response = await fetch(`/api/export?format=${format}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Erro ao exportar dados: ${response.statusText}`)
      }

      // Obter o blob da resposta
      const blob = await response.blob()

      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob)

      // Criar um link para download
      const a = document.createElement("a")
      a.href = url
      a.download = format === "csv" ? "pesquisa-satisfacao.csv" : "pesquisa-satisfacao.xlsx"
      document.body.appendChild(a)
      a.click()

      // Limpar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Exportação concluída",
        description: `Os dados foram exportados com sucesso no formato ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Não foi possível exportar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 print:block">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Dados
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isExporting}>
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")} disabled={isExporting}>
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
