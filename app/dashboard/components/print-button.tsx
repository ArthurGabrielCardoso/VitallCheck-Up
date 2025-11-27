"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700 text-white print:hidden">
      <Printer className="mr-2 h-4 w-4" />
      Imprimir Dashboard
    </Button>
  )
}
