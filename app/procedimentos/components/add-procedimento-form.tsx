"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function AddProcedimentoForm({ onSuccess }: { onSuccess: () => void }) {
  const [codigo, setCodigo] = useState("")
  const [nome, setNome] = useState("")
  const [valor, setValor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos
      if (!codigo.trim()) {
        throw new Error("O código do procedimento é obrigatório")
      }

      if (!nome.trim()) {
        throw new Error("O nome do procedimento é obrigatório")
      }

      const valorNumerico = Number.parseFloat(valor.replace(/[^\d.,]/g, "").replace(",", "."))
      if (isNaN(valorNumerico)) {
        throw new Error("O valor do procedimento deve ser um número válido")
      }

      // Enviar para a API
      const response = await fetch("/api/procedimentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
          nome,
          valor: valorNumerico,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao adicionar procedimento")
      }

      // Limpar formulário
      setCodigo("")
      setNome("")
      setValor("")

      // Notificar sucesso
      toast({
        title: "Procedimento adicionado",
        description: "O procedimento foi adicionado com sucesso",
      })

      // Callback de sucesso
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro ao adicionar procedimento:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar procedimento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para formatar o valor como moeda
  const formatarValor = (valor: string) => {
    // Remove tudo que não for número ou vírgula
    const apenasNumeros = valor.replace(/[^\d,]/g, "")

    // Converte para número (substituindo vírgula por ponto)
    const numero = Number.parseFloat(apenasNumeros.replace(",", ".")) || 0

    // Formata como moeda brasileira
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value

    // Se o valor estiver vazio, apenas define como vazio
    if (!valor) {
      setValor("")
      return
    }

    // Remove formatação atual
    const valorSemFormatacao = valor.replace(/[^\d,]/g, "")

    // Formata como moeda
    const valorFormatado = formatarValor(valorSemFormatacao)

    // Atualiza o estado
    setValor(valorFormatado)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Procedimento</CardTitle>
        <CardDescription>Cadastre um novo procedimento odontológico</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código do Procedimento</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: PROC-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Procedimento</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Restauração em Resina"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Procedimento</Label>
            <Input id="valor" value={valor} onChange={handleValorChange} placeholder="R$ 0,00" required />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Procedimento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
