"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, CheckCircle, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"

export function ImportProcedimentos({ onSuccess }: { onSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleButtonClick = () => {
    // Acionar o clique no input de arquivo diretamente
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResults({ success: 0, errors: 0 })

    try {
      toast({
        title: "Processando arquivo",
        description: "Aguarde enquanto processamos seu arquivo...",
      })

      // Ler o arquivo XLSX
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log("Dados importados:", jsonData)

      let successCount = 0
      let errorCount = 0

      // Processar cada linha
      for (const item of jsonData) {
        try {
          // Extrair os dados da linha
          const procedimento = {
            codigo: item.Código_Interno || item["Código Interno"] || `PROC-${Math.floor(Math.random() * 10000)}`,
            nome: item.Procedimento || "",
            valor: Number.parseFloat(
              String(item.Valor || "0")
                .replace(/[^\d.,]/g, "")
                .replace(",", "."),
            ),
          }

          // Verificar se temos os dados mínimos necessários
          if (!procedimento.nome) {
            console.error("Nome do procedimento não encontrado:", item)
            errorCount++
            continue
          }

          // Enviar para a API
          const response = await fetch("/api/procedimentos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(procedimento),
          })

          if (response.ok) {
            successCount++
          } else {
            const errorData = await response.json()
            console.error("Erro ao importar procedimento:", errorData)
            errorCount++
          }
        } catch (error) {
          console.error("Erro ao processar item:", error, item)
          errorCount++
        }
      }

      setResults({ success: successCount, errors: errorCount })

      toast({
        title: "Importação concluída",
        description: `${successCount} procedimentos importados com sucesso. ${errorCount} erros.`,
        variant: errorCount > 0 && successCount === 0 ? "destructive" : "default",
      })

      if (successCount > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar o arquivo. Verifique o formato e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Limpar o input de arquivo
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Procedimentos</CardTitle>
        <CardDescription>Importe procedimentos a partir de um arquivo Excel (.xlsx)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <FileUp className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-4">Clique para selecionar um arquivo Excel</p>

          {/* Input de arquivo separado do botão */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{ display: "none" }} // Esconder o input real
          />

          {/* Botão que aciona o input de arquivo */}
          <Button onClick={handleButtonClick} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
            {isUploading ? "Processando..." : "Selecionar Arquivo"}
          </Button>
        </div>

        {results.success > 0 || results.errors > 0 ? (
          <div className="mt-4 space-y-2">
            {results.success > 0 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>{results.success} procedimentos importados com sucesso</span>
              </div>
            )}
            {results.errors > 0 && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{results.errors} erros durante a importação</span>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-gray-500 space-y-2">
        <p>O arquivo deve conter as colunas: Procedimento, Valor e Código Interno.</p>
        <p>Dica: Exporte a tabela de preços diretamente do sistema da clínica.</p>
      </CardFooter>
    </Card>
  )
}
