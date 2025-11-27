"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "../components/page-header"
import { EspecialidadeBadge } from "../components/especialidade-badge"
import {
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  Package,
  ChevronDown,
  Check,
  Search,
  ArrowDownCircle,
} from "lucide-react"
import type { Procedimento, RegistroProcedimento } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegistroDiarioPage() {
  const [registros, setRegistros] = useState<RegistroProcedimento[]>([])
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingModal, setIsAddingModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [selectedProcedimento, setSelectedProcedimento] = useState<string>("")
  const [quantidade, setQuantidade] = useState("1")
  const [observacoes, setObservacoes] = useState("")
  const [realizarBaixa, setRealizarBaixa] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [regRes, procRes] = await Promise.all([
        fetch(`/api/registro-procedimentos?data=${selectedDate}`),
        fetch("/api/procedimentos"),
      ])

      if (!regRes.ok || !procRes.ok) throw new Error("Erro ao buscar dados")

      const [regData, procData] = await Promise.all([regRes.json(), procRes.json()])
      setRegistros(regData)
      setProcedimentos(procData)
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

  const handleAddRegistro = async () => {
    if (!selectedProcedimento) {
      toast({ title: "Erro", description: "Selecione um procedimento", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/registro-procedimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: selectedDate,
          procedimento_id: Number.parseInt(selectedProcedimento),
          quantidade: Number.parseInt(quantidade) || 1,
          observacoes,
          realizar_baixa: realizarBaixa,
        }),
      })

      if (!response.ok) throw new Error("Erro ao salvar")

      toast({
        title: "Sucesso",
        description: realizarBaixa ? "Procedimento registrado e estoque atualizado" : "Procedimento registrado",
      })

      setIsAddingModal(false)
      setSelectedProcedimento("")
      setQuantidade("1")
      setObservacoes("")
      setRealizarBaixa(true)
      fetchData()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o procedimento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/registro-procedimentos/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erro ao remover")
      toast({ title: "Sucesso", description: "Registro removido" })
      fetchData()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o registro",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const filteredProcedimentos = procedimentos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedProcedimentoData = procedimentos.find((p) => p.id.toString() === selectedProcedimento)

  // Calculate totals for the day
  const totalProcedimentos = registros.reduce((sum, r) => sum + r.quantidade, 0)
  const totalValor = registros.reduce((sum, r) => sum + (r.procedimento?.valor || 0) * r.quantidade, 0)

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
        title="Registro Diário"
        description="Registre os procedimentos realizados e dê baixa no estoque automaticamente"
        actions={
          <Button onClick={() => setIsAddingModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Procedimento
          </Button>
        }
      />

      {/* Date Selector and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <Label htmlFor="date" className="text-sm font-medium mb-2 block">
              Data
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Procedimentos</p>
                <p className="text-2xl font-bold">{totalProcedimentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValor)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ArrowDownCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Baixa Estoque</p>
                <p className="text-2xl font-bold">{registros.filter((r) => r.baixa_estoque_realizada).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registros do Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Procedimentos do Dia -{" "}
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {registros.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhum procedimento registrado</p>
              <p className="text-sm mb-4">Comece registrando os procedimentos realizados neste dia</p>
              <Button onClick={() => setIsAddingModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Procedimento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Valor Unit.</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Baixa Estoque</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((registro, index) => (
                    <TableRow
                      key={registro.id}
                      className="animate-slide-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{registro.procedimento?.nome || "—"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {registro.procedimento?.codigo || "Sem código"}
                            </span>
                            {registro.procedimento?.especialidade && (
                              <EspecialidadeBadge especialidade={registro.procedimento.especialidade} />
                            )}
                          </div>
                          {registro.observacoes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{registro.observacoes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-medium text-lg">{registro.quantidade}x</span>
                      </TableCell>
                      <TableCell className="text-center">{formatCurrency(registro.procedimento?.valor || 0)}</TableCell>
                      <TableCell className="text-center font-medium text-teal-600">
                        {formatCurrency((registro.procedimento?.valor || 0) * registro.quantidade)}
                      </TableCell>
                      <TableCell className="text-center">
                        {registro.baixa_estoque_realizada ? (
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="h-3 w-3 mr-1" />
                            Realizada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Não realizada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(registro.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Adicionar */}
      <Dialog open={isAddingModal} onOpenChange={setIsAddingModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Procedimento</DialogTitle>
            <DialogDescription>Selecione o procedimento realizado e a quantidade</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Procedimento Selector */}
            <div className="space-y-2">
              <Label>Procedimento *</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                    "bg-white hover:border-teal-400 focus:outline-none",
                    isDropdownOpen ? "border-teal-500 ring-2 ring-teal-500/20" : "border-gray-200",
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {selectedProcedimentoData ? (
                      <div>
                        <p className="font-medium">{selectedProcedimentoData.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProcedimentoData.codigo} - {formatCurrency(selectedProcedimentoData.valor || 0)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Selecione um procedimento</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn("h-5 w-5 text-gray-400 transition-transform", isDropdownOpen && "rotate-180")}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border shadow-xl overflow-hidden">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar procedimento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredProcedimentos.map((proc) => (
                        <button
                          key={proc.id}
                          type="button"
                          onClick={() => {
                            setSelectedProcedimento(proc.id.toString())
                            setIsDropdownOpen(false)
                            setSearchTerm("")
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-teal-50",
                            selectedProcedimento === proc.id.toString() && "bg-teal-50",
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              selectedProcedimento === proc.id.toString()
                                ? "border-teal-500 bg-teal-500"
                                : "border-gray-300",
                            )}
                          >
                            {selectedProcedimento === proc.id.toString() && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{proc.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{proc.codigo || "Sem código"}</span>
                              <span>•</span>
                              <span className="text-teal-600 font-medium">{formatCurrency(proc.valor || 0)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Input
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações sobre o procedimento..."
              />
            </div>

            {/* Baixa de Estoque */}
            <div className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <Checkbox
                id="baixa"
                checked={realizarBaixa}
                onCheckedChange={(checked) => setRealizarBaixa(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="baixa" className="font-medium cursor-pointer">
                  Realizar baixa no estoque
                </Label>
                <p className="text-sm text-muted-foreground">
                  Os materiais utilizados neste procedimento serão deduzidos automaticamente do estoque
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRegistro} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Registrar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
