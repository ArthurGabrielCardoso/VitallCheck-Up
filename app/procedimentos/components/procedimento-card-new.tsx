"use client"

import { Card } from "@/components/ui/card"
import { EspecialidadeBadge } from "./especialidade-badge"
import { useRouter } from "next/navigation"
import type { Procedimento } from "@/lib/supabase"
import { ArrowUpRight } from "lucide-react"

interface ProcedimentoCardProps {
  procedimento: Procedimento
}

const VALOR_HORA_CLINICA = 151.94
const COMISSAO_PERCENT = 30

export function ProcedimentoCard({ procedimento }: ProcedimentoCardProps) {
  const router = useRouter()
  const custoMateriais = procedimento.custo_materiais || 0

  const calcularNovoValor = () => {
    const laboratorio = procedimento.laboratorio || 0
    const hr = procedimento.hr || 1
    const lucro = procedimento.lucro_percent || 20

    const custoHoraClinica = VALOR_HORA_CLINICA * hr
    const custosTotais = custoMateriais + laboratorio + custoHoraClinica
    const percentualTotal = (COMISSAO_PERCENT + lucro) / 100

    if (percentualTotal >= 1) return 0
    return custosTotais / (1 - percentualTotal)
  }

  const novoValor = calcularNovoValor()
  const lucroCalculado = procedimento.lucro_percent || 20

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getMargemColor = () => {
    if (lucroCalculado >= 25) return "text-emerald-600"
    if (lucroCalculado >= 15) return "text-amber-600"
    return "text-red-500"
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 border-0 bg-white"
      onClick={() => router.push(`/procedimentos/${procedimento.id}`)}
    >
      {/* Header com gradiente sutil */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />

      <div className="p-5">
        {/* Nome e Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-teal-700 transition-colors truncate">
              {procedimento.nome}
            </h3>
            {procedimento.codigo && <p className="text-xs text-gray-400 mt-0.5">{procedimento.codigo}</p>}
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
        </div>

        {/* Especialidade */}
        <div className="mb-4">
          <EspecialidadeBadge especialidade={procedimento.especialidade || "Outros"} />
        </div>

        {/* Valores - Layout simplificado */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Preço Sugerido</p>
            <p className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
              {formatCurrency(novoValor)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Margem</p>
            <p className={`text-sm font-semibold ${getMargemColor()}`}>{lucroCalculado}%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
