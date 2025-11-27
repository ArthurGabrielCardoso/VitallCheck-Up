"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "../components/page-header"
import { getEspecialidades } from "../components/especialidade-badge"
import { ArrowLeft, Plus } from "lucide-react"

export default function NovoProcedimentoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [nome, setNome] = useState("")
  const [codigo, setCodigo] = useState("")
  const [especialidade, setEspecialidade] = useState("Outros")
  const [valor, setValor] = useState("")
  const [laboratorio, setLaboratorio] = useState("0")
  const [hr, setHr] = useState("1")
  const [lucroPercent, setLucroPercent] = useState("20")

  useEffect(() => {
    const token = localStorage.getItem("procedimentos-token")
    if (!token) {
      router.push("/procedimentos")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do procedimento é obrigatório",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/procedimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          codigo,
          especialidade,
          valor: Number.parseFloat(valor) || 0,
          laboratorio: Number.parseFloat(laboratorio) || 0,
          hr: Number.parseFloat(hr) || 1,
          lucro_percent: Number.parseFloat(lucroPercent) || 20,
        }),
      })

      if (!response.ok) throw new Error("Erro ao criar procedimento")

      const data = await response.json()

      toast({
        title: "Sucesso",
        description: "Procedimento criado com sucesso",
      })

      router.push(`/procedimentos/${data.id}`)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o procedimento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Novo Procedimento"
        description="Cadastre um novo procedimento odontológico"
        actions={
          <Button variant="outline" onClick={() => router.push("/procedimentos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações do Procedimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Restauração em Resina"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: REST-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select value={especialidade} onValueChange={setEspecialidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {getEspecialidades().map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Preço (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorio">Custo Laboratório (R$)</Label>
                <Input
                  id="laboratorio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={laboratorio}
                  onChange={(e) => setLaboratorio(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hr">Horas Clínicas (HR)</Label>
                <Input id="hr" type="number" step="0.1" min="0.1" value={hr} onChange={(e) => setHr(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lucro">Margem de Lucro (%)</Label>
                <Input
                  id="lucro"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={lucroPercent}
                  onChange={(e) => setLucroPercent(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar Procedimento
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/procedimentos")}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
