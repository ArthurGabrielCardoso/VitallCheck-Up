"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { FileUp } from "lucide-react"
import * as XLSX from "xlsx"

export default function ImportarPage() {
  const [result, setResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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

    setIsProcessing(true)
    setResult(null)

    try {
      toast({
        title: "Arquivo selecionado",
        description: `Processando ${file.name}...`,
      })

      // Passo 1: Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Passo 2: Tentar processar com XLSX
      try {
        const workbook = XLSX.read(arrayBuffer)
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Mostrar os dados processados
        setResult({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          sheetName: firstSheetName,
          rowCount: jsonData.length,
          sampleData: jsonData.slice(0, 3),
          fullData: jsonData,
        })

        toast({
          title: "Arquivo processado com sucesso",
          description: `Encontradas ${jsonData.length} linhas de dados.`,
        })
      } catch (xlsxError) {
        console.error("Erro ao processar XLSX:", xlsxError)
        setResult({
          error: "Erro ao processar o arquivo Excel",
          details: xlsxError instanceof Error ? xlsxError.message : String(xlsxError),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        })

        toast({
          title: "Erro ao processar arquivo",
          description: "O arquivo não pôde ser processado como Excel.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao ler arquivo:", error)
      setResult({
        error: "Erro ao ler o arquivo",
        details: error instanceof Error ? error.message : String(error),
      })

      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const importData = async () => {
    if (!result?.fullData) return

    setIsProcessing(true)

    try {
      let successCount = 0
      let errorCount = 0

      // Processar cada linha
      for (const item of result.fullData) {
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

      toast({
        title: "Importação concluída",
        description: `${successCount} procedimentos importados com sucesso. ${errorCount} erros.`,
        variant: errorCount > 0 && successCount === 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Erro ao importar dados:", error)
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Importação de Procedimentos</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo Excel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <FileUp className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">Selecione um arquivo Excel (.xlsx)</p>

              {/* Input de arquivo separado do botão */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                style={{ display: "none" }} // Esconder o input real
              />

              {/* Botão que aciona o input de arquivo */}
              <Button onClick={handleButtonClick} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                {isProcessing ? "Processando..." : "Selecionar Arquivo"}
              </Button>
            </div>

            {result && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Resultado do Processamento:</h3>

                {result.error ? (
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-red-600 font-medium">{result.error}</p>
                    <p className="text-red-500 text-sm mt-1">{result.details}</p>

                    {result.fileName && (
                      <div className="mt-2 text-sm">
                        <p>Nome do arquivo: {result.fileName}</p>
                        <p>Tamanho: {(result.fileSize / 1024).toFixed(2)} KB</p>
                        <p>Tipo: {result.fileType}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <p className="text-green-600 font-medium">Arquivo processado com sucesso!</p>
                      <div className="mt-2 text-sm">
                        <p>Nome do arquivo: {result.fileName}</p>
                        <p>Tamanho: {(result.fileSize / 1024).toFixed(2)} KB</p>
                        <p>Planilha: {result.sheetName}</p>
                        <p>Linhas encontradas: {result.rowCount}</p>
                      </div>
                    </div>

                    {result.sampleData && result.sampleData.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amostra de Dados:</h4>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                          {JSON.stringify(result.sampleData, null, 2)}
                        </pre>

                        <Button
                          onClick={importData}
                          className="mt-4 bg-green-600 hover:bg-green-700"
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Importando..." : "Importar Todos os Dados"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
