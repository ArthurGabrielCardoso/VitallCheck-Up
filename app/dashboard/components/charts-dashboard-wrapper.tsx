"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { ChartsDashboard } from "./charts-dashboard"

export function ChartsDashboardWrapper({ surveyResponses, statistics, dentistCounts, specialtyCounts }) {
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Verificar se os dados são válidos
  const hasValidData =
    surveyResponses &&
    Array.isArray(surveyResponses) &&
    statistics &&
    typeof statistics === "object" &&
    dentistCounts &&
    Array.isArray(dentistCounts) &&
    specialtyCounts &&
    Array.isArray(specialtyCounts)

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando gráficos...</span>
      </div>
    )
  }

  if (!hasValidData) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Não foi possível carregar os dados para os gráficos.</AlertDescription>
      </Alert>
    )
  }

  // Preparar os dados para o componente ChartsDashboard
  const dashboardData = {
    surveyResponses,
    statistics,
    dentistCounts,
    specialtyCounts,
  }

  return <ChartsDashboard dashboardData={dashboardData} />
}
