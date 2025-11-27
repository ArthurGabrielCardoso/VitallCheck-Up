"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart2 } from "lucide-react"

export function AIAnalysisButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    try {
      setIsLoading(true)
      // Redirecionar para a página de análise de IA
      router.push("/dashboard/ai-analysis")
    } catch (error) {
      console.error("Erro ao navegar para análise de IA:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
      {isLoading ? (
        "Carregando..."
      ) : (
        <>
          <BarChart2 className="mr-2 h-4 w-4" />
          Análise Avançada
        </>
      )}
    </Button>
  )
}
