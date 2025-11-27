import { cn } from "@/lib/utils"

const especialidades = {
  Cirurgia: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: "⚕️" },
  Dentística: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: "🦷" },
  Endodontia: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: "🔬" },
  Periodontia: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: "🌿" },
  Ortodontia: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: "📐" },
  Prótese: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400", icon: "🔧" },
  Outros: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: "📋" },
} as const

export type EspecialidadeType = keyof typeof especialidades

interface EspecialidadeBadgeProps {
  especialidade: string
  showIcon?: boolean
  className?: string
}

export function EspecialidadeBadge({ especialidade, showIcon = true, className }: EspecialidadeBadgeProps) {
  const config = especialidades[especialidade as EspecialidadeType] || especialidades.Outros

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.color,
        className,
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{especialidade}</span>
    </span>
  )
}

export function getEspecialidades() {
  return Object.keys(especialidades)
}
