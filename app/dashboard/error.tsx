"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado!</h2>
        <p className="text-gray-600 mb-6">
          Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={reset} className="bg-primary hover:bg-primary/90 text-white">
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
