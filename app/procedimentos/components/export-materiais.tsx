"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

interface Material {
  id: number
  nome: string
  valor_embalagem: number
  qtde_embalagem: string
  rendimento: string
  valor_fracionado: number
}

export function ExportMateriais() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Buscar todos os materiais
      const response = await fetch("/api/materiais")
      if (!response.ok) {
        throw new Error("Erro ao buscar materiais")
      }

      const materiais: Material[] = await response.json()

      // Formatar os dados para exportação
      const formattedData = materiais.map((material) => ({
        Nome: material.nome,
        "Valor Embalagem": `R$ ${material.valor_embalagem.toFixed(2).replace(".", ",")}`,
        "Quantidade na Embalagem": material.qtde_embalagem,
        Rendimento: material.rendimento,
        "Valor Fracionado": `R$ ${material.valor_fracionado.toFixed(2).replace(".", ",")}`,
      }))

      // Criar um arquivo CSV
      let csvContent = "Nome\tValor Embalagem\tQuantidade na Embalagem\tRendimento\tValor Fracionado\n"

      formattedData.forEach((item) => {
        const row = [
          item.Nome,
          item["Valor Embalagem"],
          item["Quantidade na Embalagem"],
          item.Rendimento,
          item["Valor Fracionado"],
        ].join("\t")
        csvContent += row + "\n"
      })

      // Criar um blob e fazer o download
      const blob = new Blob([csvContent], { type: "text/tab-separated-values" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `materiais_${new Date().toISOString().split("T")[0]}.tsv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportação concluída",
        description: `${materiais.length} materiais exportados com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao exportar materiais:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao exportar os materiais",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Materiais</CardTitle>
        <CardDescription>Exporte a lista de materiais para um arquivo TSV (compatível com Excel)</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={exportToExcel} disabled={isExporting} className="w-full">
          {isExporting ? (
            "Exportando..."
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Materiais
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
