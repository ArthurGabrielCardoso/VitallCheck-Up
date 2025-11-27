import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react"

interface LucroBadgeProps {
  lucro: number
  className?: string
}

export function LucroBadge({ lucro, className }: LucroBadgeProps) {
  const getStatus = () => {
    if (lucro >= 20) return { color: "status-ok", icon: TrendingUp, label: "Excelente" }
    if (lucro >= 10) return { color: "status-warning", icon: Minus, label: "Bom" }
    return { color: "status-critical", icon: TrendingDown, label: "Baixo" }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        status.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{lucro.toFixed(1)}%</span>
    </span>
  )
}

interface EstoqueBadgeProps {
  quantidadeAtual: number
  quantidadeMinima: number
  className?: string
}

export function EstoqueBadge({ quantidadeAtual, quantidadeMinima, className }: EstoqueBadgeProps) {
  const getStatus = () => {
    const percentual = (quantidadeAtual / quantidadeMinima) * 100

    if (percentual >= 100) return { color: "status-ok", icon: CheckCircle2, label: "OK" }
    if (percentual >= 50) return { color: "status-warning", icon: AlertTriangle, label: "Baixo" }
    return { color: "status-critical", icon: AlertTriangle, label: "Crítico" }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        status.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{status.label}</span>
    </span>
  )
}
