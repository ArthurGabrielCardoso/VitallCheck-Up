"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { MarkdownRenderer } from "./markdown-renderer"

export function AIAnalysisContent() {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/survey-analysis")

        if (!response.ok) {
          throw new Error(`Erro ao gerar análise: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setAnalysis(data.analysis)
      } catch (err) {
        console.error("Erro ao buscar análise:", err)
        setError(err instanceof Error ? err.message : "Erro ao gerar análise")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <div className="text-sm text-gray-500">Análise gerada em: {new Date().toLocaleDateString("pt-BR")}</div>
      </div>

      {isLoading && (
        <Card className="p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg">Gerando análise avançada...</p>
            <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos.</p>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && analysis && (
        <Card className="p-8">
          <MarkdownRenderer content={analysis} />
        </Card>
      )}

      {!isLoading && !error && !analysis && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sem dados</AlertTitle>
          <AlertDescription>
            Não foi possível gerar a análise. Verifique se há dados suficientes no sistema.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
