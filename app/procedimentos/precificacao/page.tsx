"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "../components/page-header"
import { EspecialidadeBadge } from "../components/especialidade-badge"
import { LucroBadge } from "../components/status-badge"
import { useToast } from "@/components/ui/use-toast"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calculator, ArrowRight, Percent } from "lucide-react"
import type { Procedimento } from "@/lib/supabase"

const VALOR_HORA_CLINICA = 151.94
const COMISSAO_PERCENT = 30

export default function PrecificacaoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculadora
  const [custoMaterial, setCustoMaterial] = useState("")
  const [custoLab, setCustoLab] = useState("")
  const [horasClinicas, setHorasClinicas] = useState("1")
  const [margemLucro, setMargemLucro] = useState("20")

  useEffect(() => {
    const token = localStorage.getItem("procedimentos-token")
    if (!token) {
      router.push("/procedimentos")
      return
    }
    fetchProcedimentos()
  }, [])

  const fetchProcedimentos = async () => {
    try {
      const response = await fetch("/api/procedimentos")
      if (!response.ok) throw new Error("Erro ao buscar procedimentos")
      const data = await response.json()
      setProcedimentos(data)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os procedimentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cálculos de estatísticas
  const calcularEstatisticas = () => {
    if (procedimentos.length === 0) return null

    const procedimentosComValor = procedimentos.filter((p) => p.valor && p.valor > 0)

    const totalValor = procedimentosComValor.reduce((sum, p) => sum + (p.valor || 0), 0)
    const mediaValor = totalValor / procedimentosComValor.length || 0

    const totalCusto = procedimentosComValor.reduce((sum, p) => sum + (p.custo_materiais || 0), 0)
    const mediaCusto = totalCusto / procedimentosComValor.length || 0

    // Procedimentos com margem baixa (< 15%)
    const procedimentosBaixaMargem = procedimentosComValor.filter((p) => {
      const custo = (p.custo_materiais || 0) + (p.laboratorio || 0) + VALOR_HORA_CLINICA * (p.hr || 1)
      const margem = p.valor ? ((p.valor - custo) / p.valor) * 100 : 0
      return margem < 15
    })

    // Procedimentos mais lucrativos
    const procedimentosOrdenados = [...procedimentosComValor].sort((a, b) => {
      const custoA = (a.custo_materiais || 0) + (a.laboratorio || 0) + VALOR_HORA_CLINICA * (a.hr || 1)
      const custoB = (b.custo_materiais || 0) + (b.laboratorio || 0) + VALOR_HORA_CLINICA * (b.hr || 1)
      const margemA = a.valor ? ((a.valor - custoA) / a.valor) * 100 : 0
      const margemB = b.valor ? ((b.valor - custoB) / b.valor) * 100 : 0
      return margemB - margemA
    })

    return {
      totalProcedimentos: procedimentos.length,
      mediaValor,
      mediaCusto,
      procedimentosBaixaMargem,
      topLucrativos: procedimentosOrdenados.slice(0, 5),
      menosProcedimentos: procedimentosOrdenados.slice(-5).reverse(),
    }
  }

  // Calculadora de preço
  const calcularPrecoSugerido = () => {
    const material = Number.parseFloat(custoMaterial) || 0
    const lab = Number.parseFloat(custoLab) || 0
    const hr = Number.parseFloat(horasClinicas) || 1
    const lucro = Number.parseFloat(margemLucro) || 20

    const custoHoraClinica = VALOR_HORA_CLINICA * hr
    const custosTotais = material + lab + custoHoraClinica
    const percentualTotal = (COMISSAO_PERCENT + lucro) / 100

    if (percentualTotal >= 1) return 0
    return custosTotais / (1 - percentualTotal)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const stats = calcularEstatisticas()
  const precoCalculado = calcularPrecoSugerido()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Precificação" description="Análise de preços, margens e calculadora de precificação" />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.mediaValor || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.mediaCusto || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Procedimentos</p>
                <p className="text-2xl font-bold">{stats?.totalProcedimentos || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Margem Baixa</p>
                <p className="text-2xl font-bold">{stats?.procedimentosBaixaMargem?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculadora */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora de Preço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custoMaterial">Custo de Material (R$)</Label>
              <Input
                id="custoMaterial"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={custoMaterial}
                onChange={(e) => setCustoMaterial(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custoLab">Custo de Laboratório (R$)</Label>
              <Input
                id="custoLab"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={custoLab}
                onChange={(e) => setCustoLab(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasClinicas">Horas Clínicas (HR)</Label>
              <Input
                id="horasClinicas"
                type="number"
                step="0.1"
                min="0.1"
                value={horasClinicas}
                onChange={(e) => setHorasClinicas(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Valor HR: {formatCurrency(VALOR_HORA_CLINICA)} × {horasClinicas} ={" "}
                {formatCurrency(VALOR_HORA_CLINICA * (Number.parseFloat(horasClinicas) || 1))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
              <Input
                id="margemLucro"
                type="number"
                step="1"
                min="0"
                max="100"
                value={margemLucro}
                onChange={(e) => setMargemLucro(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comissão fixa: {COMISSAO_PERCENT}%</p>
            </div>

            <div className="pt-4 border-t">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(precoCalculado)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procedimentos com margem baixa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Atenção: Margem Baixa ({"<"} 15%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.procedimentosBaixaMargem && stats.procedimentosBaixaMargem.length > 0 ? (
              <div className="space-y-3">
                {stats.procedimentosBaixaMargem.slice(0, 5).map((proc) => {
                  const custo =
                    (proc.custo_materiais || 0) + (proc.laboratorio || 0) + VALOR_HORA_CLINICA * (proc.hr || 1)
                  const margem = proc.valor ? ((proc.valor - custo) / proc.valor) * 100 : 0

                  return (
                    <div
                      key={proc.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/procedimentos/${proc.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <EspecialidadeBadge especialidade={proc.especialidade || "Outros"} />
                        <div>
                          <p className="font-medium">{proc.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Preço: {formatCurrency(proc.valor || 0)} | Custo: {formatCurrency(custo)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <LucroBadge lucro={margem} />
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Todos os procedimentos estão com margem saudável!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top procedimentos lucrativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Mais Lucrativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topLucrativos?.map((proc, index) => {
                const custo =
                  (proc.custo_materiais || 0) + (proc.laboratorio || 0) + VALOR_HORA_CLINICA * (proc.hr || 1)
                const margem = proc.valor ? ((proc.valor - custo) / proc.valor) * 100 : 0

                return (
                  <div
                    key={proc.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => router.push(`/procedimentos/${proc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{proc.nome}</p>
                        <p className="text-xs text-muted-foreground">{proc.especialidade || "Outros"}</p>
                      </div>
                    </div>
                    <LucroBadge lucro={margem} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Menos Lucrativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.menosProcedimentos?.map((proc, index) => {
                const custo =
                  (proc.custo_materiais || 0) + (proc.laboratorio || 0) + VALOR_HORA_CLINICA * (proc.hr || 1)
                const margem = proc.valor ? ((proc.valor - custo) / proc.valor) * 100 : 0

                return (
                  <div
                    key={proc.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => router.push(`/procedimentos/${proc.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{proc.nome}</p>
                        <p className="text-xs text-muted-foreground">{proc.especialidade || "Outros"}</p>
                      </div>
                    </div>
                    <LucroBadge lucro={margem} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
