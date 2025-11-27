"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "../components/page-header"
import { EspecialidadeBadge } from "../components/especialidade-badge"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  DollarSign,
  FileText,
  Download,
  Calendar,
  ArrowDown,
} from "lucide-react"
import type { Procedimento, Material, RegistroProcedimento } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const VALOR_HORA_CLINICA = 151.94

export default function RelatoriosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [registros, setRegistros] = useState<RegistroProcedimento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("Todas")
  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split("T")[0]
  })
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split("T")[0])

  useEffect(() => {
    const token = localStorage.getItem("procedimentos-token")
    if (!token) {
      router.push("/procedimentos")
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [procRes, matRes, regRes] = await Promise.all([
        fetch("/api/procedimentos"),
        fetch("/api/materiais"),
        fetch("/api/registro-procedimentos"),
      ])

      if (!procRes.ok || !matRes.ok) throw new Error("Erro ao buscar dados")

      const [procData, matData, regData] = await Promise.all([
        procRes.json(),
        matRes.json(),
        regRes.ok ? regRes.json() : [],
      ])

      setProcedimentos(procData)
      setMateriais(matData)
      setRegistros(regData)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Filter registros by date range
  const registrosFiltrados = registros.filter((reg) => {
    const regDate = new Date(reg.data)
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    fim.setHours(23, 59, 59)
    return regDate >= inicio && regDate <= fim
  })

  // Calculate real statistics from registros
  const estatisticasReais = () => {
    const stats: Record<string, { count: number; totalValor: number; totalCusto: number }> = {}

    registrosFiltrados.forEach((reg) => {
      const proc = reg.procedimento || procedimentos.find((p) => p.id === reg.procedimento_id)
      if (!proc) return

      const esp = proc.especialidade || "Outros"
      if (!stats[esp]) {
        stats[esp] = { count: 0, totalValor: 0, totalCusto: 0 }
      }

      const qtd = reg.quantidade || 1
      stats[esp].count += qtd
      stats[esp].totalValor += (proc.valor || 0) * qtd
      stats[esp].totalCusto +=
        ((proc.custo_materiais || 0) + (proc.laboratorio || 0) + VALOR_HORA_CLINICA * (proc.hr || 1)) * qtd
    })

    return Object.entries(stats)
      .map(([esp, data]) => ({
        especialidade: esp,
        ...data,
        mediaValor: data.count > 0 ? data.totalValor / data.count : 0,
        mediaCusto: data.count > 0 ? data.totalCusto / data.count : 0,
        margemMedia: data.totalValor > 0 ? ((data.totalValor - data.totalCusto) / data.totalValor) * 100 : 0,
        lucroTotal: data.totalValor - data.totalCusto,
      }))
      .sort((a, b) => b.totalValor - a.totalValor)
  }

  // Estatísticas de estoque
  const estatisticasMateriais = () => {
    const total = materiais.length
    const valorTotalEstoque = materiais.reduce(
      (sum, m) => sum + (m.valor_fracionado || 0) * (m.quantidade_estoque || 0),
      0,
    )
    const baixoEstoque = materiais.filter((m) => (m.quantidade_estoque || 0) <= (m.quantidade_minima || 5)).length
    const vencendo = materiais.filter((m) => {
      if (!m.data_validade) return false
      const dias = Math.ceil((new Date(m.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return dias <= 30 && dias > 0
    }).length

    return { total, valorTotalEstoque, baixoEstoque, vencendo }
  }

  // Top procedimentos realizados
  const topProcedimentos = () => {
    const counts: Record<number, { procedimento: Procedimento; quantidade: number; valor: number }> = {}

    registrosFiltrados.forEach((reg) => {
      const proc = reg.procedimento || procedimentos.find((p) => p.id === reg.procedimento_id)
      if (!proc) return

      if (!counts[proc.id]) {
        counts[proc.id] = { procedimento: proc, quantidade: 0, valor: 0 }
      }
      counts[proc.id].quantidade += reg.quantidade || 1
      counts[proc.id].valor += (proc.valor || 0) * (reg.quantidade || 1)
    })

    return Object.values(counts)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10)
  }

  const statsEsp = estatisticasReais()
  const statsMat = estatisticasMateriais()
  const top = topProcedimentos()

  // Totals
  const totalFaturamento = statsEsp.reduce((sum, s) => sum + s.totalValor, 0)
  const totalCusto = statsEsp.reduce((sum, s) => sum + s.totalCusto, 0)
  const totalLucro = totalFaturamento - totalCusto
  const margemGeral = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0
  const totalProcedimentosRealizados = statsEsp.reduce((sum, s) => sum + s.count, 0)

  // Export
  const exportarRelatorio = () => {
    const dados = [
      "RELATÓRIO DE PROCEDIMENTOS",
      `Período: ${new Date(dataInicio).toLocaleDateString("pt-BR")} a ${new Date(dataFim).toLocaleDateString("pt-BR")}`,
      "",
      "RESUMO GERAL",
      `Total de Procedimentos: ${totalProcedimentosRealizados}`,
      `Faturamento Total: ${formatCurrency(totalFaturamento)}`,
      `Custo Total: ${formatCurrency(totalCusto)}`,
      `Lucro Total: ${formatCurrency(totalLucro)}`,
      `Margem Média: ${margemGeral.toFixed(1)}%`,
      "",
      "POR ESPECIALIDADE",
      ...statsEsp.map(
        (s) =>
          `${s.especialidade}: ${s.count} procedimentos - Faturamento: ${formatCurrency(s.totalValor)} - Lucro: ${formatCurrency(s.lucroTotal)} (${s.margemMedia.toFixed(1)}%)`,
      ),
      "",
      "TOP 10 PROCEDIMENTOS",
      ...top.map((t, i) => `${i + 1}. ${t.procedimento.nome}: ${t.quantidade}x - ${formatCurrency(t.valor)}`),
    ].join("\n")

    const blob = new Blob([dados], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${dataInicio}-${dataFim}.txt`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({ title: "Sucesso", description: "Relatório exportado!" })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Insights e estatísticas baseados em dados reais"
        actions={
          <Button onClick={exportarRelatorio} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        }
      />

      {/* Filtro de Período */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="dataInicio" className="text-sm font-medium mb-2 block">
                Data Início
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="dataFim" className="text-sm font-medium mb-2 block">
                Data Fim
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={fetchData}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Procedimentos</p>
                <p className="text-2xl font-bold">{totalProcedimentosRealizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">{formatCurrency(totalFaturamento)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ArrowDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custos</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCusto)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-teal-700">Lucro</p>
                <p className="text-2xl font-bold text-teal-700">{formatCurrency(totalLucro)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Margem</p>
                <p
                  className={`text-2xl font-bold ${margemGeral >= 20 ? "text-green-600" : margemGeral >= 10 ? "text-amber-600" : "text-red-600"}`}
                >
                  {margemGeral.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta se não houver dados */}
      {totalProcedimentosRealizados === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">Nenhum procedimento registrado no período</p>
                <p className="text-sm text-amber-700">
                  Use o "Registro Diário" para registrar os procedimentos realizados e gerar relatórios com dados reais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas por especialidade */}
      {statsEsp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Desempenho por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statsEsp.map((stat) => (
                <div
                  key={stat.especialidade}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <EspecialidadeBadge especialidade={stat.especialidade} />
                    <span className="text-2xl font-bold">{stat.count}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faturamento:</span>
                      <span className="font-medium">{formatCurrency(stat.totalValor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo:</span>
                      <span className="font-medium">{formatCurrency(stat.totalCusto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro:</span>
                      <span className="font-medium text-teal-600">{formatCurrency(stat.lucroTotal)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Margem:</span>
                      <span
                        className={`font-medium ${stat.margemMedia >= 20 ? "text-green-600" : stat.margemMedia >= 10 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {stat.margemMedia.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Procedimentos */}
      {top.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 10 Procedimentos do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">#</th>
                    <th className="text-left py-3 px-2 font-medium">Procedimento</th>
                    <th className="text-center py-3 px-2 font-medium">Quantidade</th>
                    <th className="text-right py-3 px-2 font-medium">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((item, index) => (
                    <tr key={item.procedimento.id} className="border-b hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{item.procedimento.nome}</p>
                          <p className="text-xs text-muted-foreground">{item.procedimento.codigo || "Sem código"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium">{item.quantidade}x</td>
                      <td className="py-3 px-2 text-right font-medium text-teal-600">{formatCurrency(item.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumo de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <p className="text-3xl font-bold">{statsMat.total}</p>
              <p className="text-sm text-muted-foreground">Materiais Cadastrados</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 text-center">
              <p className="text-3xl font-bold text-green-600">{formatCurrency(statsMat.valorTotalEstoque)}</p>
              <p className="text-sm text-muted-foreground">Valor em Estoque</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 text-center">
              <p className="text-3xl font-bold text-red-600">{statsMat.baixoEstoque}</p>
              <p className="text-sm text-muted-foreground">Estoque Crítico</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 text-center">
              <p className="text-3xl font-bold text-amber-600">{statsMat.vencendo}</p>
              <p className="text-sm text-muted-foreground">Vencendo em 30 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
