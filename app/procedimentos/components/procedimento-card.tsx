import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Procedimento } from "@/lib/supabase"

export function ProcedimentoCard({ procedimento }: { procedimento: Procedimento }) {
  // Formatar o valor como moeda brasileira
  const valorFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(procedimento.valor || 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium text-gray-500">{procedimento.codigo}</CardDescription>
        <CardTitle className="text-lg">{procedimento.nome}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="text-lg font-bold text-primary">{valorFormatado}</div>
      </CardContent>
      <CardFooter>
        <Link href={`/procedimentos/${procedimento.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Ver Detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
