"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle, AlertCircle } from "lucide-react"

interface Material {
  nome: string
  valor_embalagem: number
  qtde_embalagem: string
  rendimento: string
  valor_fracionado: number
}

export function ImportMateriaisText({ onSuccess }: { onSuccess: () => void }) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{
    success: number
    failed: number
    errors: string[]
    warnings: string[]
  } | null>(null)
  const { toast } = useToast()

  // Função para limpar e normalizar valores monetários
  const cleanMoneyValue = (value: string): number => {
    if (!value) return 0

    // Remover o símbolo R$ e espaços
    let cleaned = value.replace(/R\$\s*/g, "").trim()

    // Substituir vírgula por ponto para decimal
    cleaned = cleaned.replace(",", ".")

    // Remover pontos de milhar
    cleaned = cleaned.replace(/\.(?=.*\.)/g, "")

    // Converter para número
    const num = Number.parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  const processText = async () => {
    if (!text.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole o texto com os materiais",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setResults(null)

    try {
      // Dividir o texto em linhas
      const lines = text.trim().split("\n")
      const materiais: Material[] = []
      const errors: string[] = []
      const warnings: string[] = []

      // Processar cada linha
      lines.forEach((line, index) => {
        try {
          // Ignorar linhas vazias
          if (!line.trim()) {
            return
          }

          // Dividir por tabs ou múltiplos espaços
          const columns = line
            .split(/\t+|\s{2,}/)
            .map((col) => col.trim())
            .filter(Boolean)

          // Se não tiver pelo menos 2 colunas (nome e valor), registrar um aviso e pular
          if (columns.length < 2) {
            warnings.push(`Linha ${index + 1}: Formato não reconhecido - "${line}"`)
            return
          }

          // Extrair os dados
          const nome = columns[0]

          // Processar valor da embalagem
          let valorEmbalagem = 0
          // Procurar o primeiro valor monetário
          for (let i = 1; i < columns.length; i++) {
            if (columns[i].includes("R$")) {
              valorEmbalagem = cleanMoneyValue(columns[i])
              break
            }
          }

          if (valorEmbalagem <= 0) {
            warnings.push(`Linha ${index + 1}: Valor da embalagem inválido ou não encontrado - "${line}"`)
            return
          }

          // Qtde embalagem e rendimento - usar valores padrão se não encontrados
          const qtdeEmbalagem = columns.length >= 3 ? columns[2] : "1"
          const rendimento = columns.length >= 4 ? columns[3] : "1"

          // Processar valor fracionado
          let valorFracionado = 0
          // Procurar o segundo valor monetário
          let foundFirst = false
          for (let i = 1; i < columns.length; i++) {
            if (columns[i].includes("R$")) {
              if (foundFirst) {
                valorFracionado = cleanMoneyValue(columns[i])
                break
              }
              foundFirst = true
            }
          }

          // Se não encontrou um segundo valor monetário, calcular com base no rendimento
          if (valorFracionado <= 0) {
            const rendimentoNum = Number.parseInt(rendimento) || 1
            valorFracionado = valorEmbalagem / rendimentoNum
          }

          materiais.push({
            nome,
            valor_embalagem: valorEmbalagem,
            qtde_embalagem: qtdeEmbalagem || "1",
            rendimento: rendimento || "1",
            valor_fracionado: valorFracionado || valorEmbalagem,
          })
        } catch (error) {
          errors.push(`Linha ${index + 1}: ${error instanceof Error ? error.message : String(error)}`)
        }
      })

      if (materiais.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum material válido encontrado no texto",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      console.log(`Enviando ${materiais.length} materiais para importação em lote`)

      // Enviar todos os materiais de uma vez usando o endpoint de batch
      const response = await fetch("/api/materiais/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ materiais }),
      })

      const result = await response.json()

      if (response.ok) {
        setResults({
          success: result.data?.length || 0,
          failed: materiais.length - (result.data?.length || 0),
          errors,
          warnings,
        })

        toast({
          title: "Sucesso",
          description: `${result.data?.length || 0} materiais importados com sucesso`,
        })

        onSuccess()
      } else {
        errors.push(`Erro ao importar materiais: ${result.error || "Erro desconhecido"}`)
        setResults({
          success: 0,
          failed: materiais.length,
          errors,
          warnings,
        })

        toast({
          title: "Erro",
          description: "Ocorreu um erro ao importar os materiais",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao processar texto:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o texto",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Materiais a partir de Texto</CardTitle>
        <CardDescription>
          Cole a lista de materiais no formato: Nome, Valor Embalagem, Qtde Embalagem, Rendimento, Valor Fracionado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Formato esperado</AlertTitle>
          <AlertDescription>
            Cole o texto com os materiais separados por tabs ou espaços.
            <br />
            <code>Nome do Material [tab] R$ XX,XX [tab] Qtde [tab] Rendimento [tab] R$ XX,XX</code>
            <br />
            <br />
            <strong>Formatos alternativos aceitos:</strong>
            <br />
            <code>Nome do Material [tab] R$ XX,XX [tab] R$ XX,XX</code>
            <br />
            <code>Nome do Material [tab] R$ XX,XX</code> (valor fracionado será calculado)
          </AlertDescription>
        </Alert>

        <Textarea
          placeholder="Cole aqui a lista de materiais..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] font-mono"
        />

        <Button onClick={processText} disabled={isProcessing || !text.trim()} className="w-full">
          {isProcessing ? "Processando..." : "Importar Materiais"}
        </Button>

        {results && (
          <div className="space-y-2 mt-4">
            <Alert variant={results.failed === 0 && results.warnings.length === 0 ? "default" : "destructive"}>
              {results.failed === 0 && results.warnings.length === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Resultado da importação</AlertTitle>
              <AlertDescription>
                <p>{results.success} materiais importados com sucesso</p>
                {results.failed > 0 && <p>{results.failed} materiais com erro</p>}
                {results.warnings.length > 0 && <p>{results.warnings.length} avisos</p>}
              </AlertDescription>
            </Alert>

            {results.warnings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Avisos:</h4>
                <div className="bg-gray-100 p-2 rounded-md max-h-[200px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {results.warnings.map((warning, index) => (
                      <li key={index} className="text-amber-600">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Erros:</h4>
                <div className="bg-gray-100 p-2 rounded-md max-h-[200px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index} className="text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
