"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import type { Material } from "@/lib/supabase"

interface EditMaterialFormProps {
  material: Material | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditMaterialForm({ material, isOpen, onClose, onSuccess }: EditMaterialFormProps) {
  const [nome, setNome] = useState("")
  const [valorEmbalagem, setValorEmbalagem] = useState("")
  const [valorEmbalagemComDesconto, setValorEmbalagemComDesconto] = useState("")
  const [qtdeEmbalagem, setQtdeEmbalagem] = useState("")
  const [rendimento, setRendimento] = useState("")
  const [valorFracionado, setValorFracionado] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Carregar dados do material quando o modal abrir
  useEffect(() => {
    if (material) {
      setNome(material.nome)
      setValorEmbalagem(material.valor_embalagem.toString())
      setQtdeEmbalagem(material.qtde_embalagem)
      setRendimento(material.rendimento)
      setValorFracionado(material.valor_fracionado.toString())

      // Calcular valor com desconto
      const valorComDesconto = material.valor_embalagem * 0.9
      setValorEmbalagemComDesconto(valorComDesconto.toFixed(2))
    }
  }, [material])

  // Calcular valor com desconto quando o valor da embalagem mudar
  useEffect(() => {
    if (valorEmbalagem) {
      try {
        const valorOriginal = Number.parseFloat(valorEmbalagem)
        const valorComDesconto = valorOriginal * 0.9 // Aplica 10% de desconto
        setValorEmbalagemComDesconto(valorComDesconto.toFixed(2))
      } catch (error) {
        console.error("Erro ao calcular valor com desconto:", error)
      }
    }
  }, [valorEmbalagem])

  // Calcular automaticamente o valor fracionado quando o valor da embalagem ou rendimento mudar
  useEffect(() => {
    if (valorEmbalagem && rendimento) {
      try {
        const valorOriginal = Number.parseFloat(valorEmbalagem)
        const valorComDesconto = valorOriginal * 0.9 // Aplica 10% de desconto
        const rendimentoNum = Number.parseFloat(rendimento)

        if (!isNaN(valorComDesconto) && !isNaN(rendimentoNum) && rendimentoNum > 0) {
          const calculatedValue = valorComDesconto / rendimentoNum
          setValorFracionado(calculatedValue.toFixed(2))
        }
      } catch (error) {
        console.error("Erro ao calcular valor fracionado:", error)
      }
    }
  }, [valorEmbalagem, rendimento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!material) return

    if (!nome.trim() || !valorEmbalagem || !qtdeEmbalagem || !rendimento) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Calcular o valor fracionado final antes de enviar
      const valorOriginal = Number.parseFloat(valorEmbalagem)
      const valorComDesconto = valorOriginal * 0.9 // Aplica 10% de desconto
      const rendimentoNum = Number.parseFloat(rendimento)
      const valorFracionadoFinal = valorComDesconto / rendimentoNum

      const response = await fetch(`/api/materiais/${material.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          valor_embalagem: valorOriginal, // Salva o valor original
          qtde_embalagem: qtdeEmbalagem,
          rendimento,
          valor_fracionado: valorFracionadoFinal,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar material")
      }

      toast({
        title: "Sucesso",
        description: "Material atualizado com sucesso",
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Erro ao atualizar material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o material",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!material) return

    if (!confirm(`Tem certeza que deseja excluir o material "${material.nome}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/materiais/${material.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir material")
      }

      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso",
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Erro ao excluir material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!material) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Material</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do material"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorEmbalagem">Valor Original da Embalagem (R$)</Label>
              <Input
                id="valorEmbalagem"
                type="number"
                step="0.01"
                min="0"
                value={valorEmbalagem}
                onChange={(e) => setValorEmbalagem(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorEmbalagemComDesconto">
                Valor com Desconto (R$)
                <span className="text-xs text-muted-foreground ml-1">(10% off)</span>
              </Label>
              <Input
                id="valorEmbalagemComDesconto"
                type="number"
                step="0.01"
                min="0"
                value={valorEmbalagemComDesconto}
                readOnly
                className="bg-gray-50"
                placeholder="Calculado automaticamente"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtdeEmbalagem">Quantidade na Embalagem</Label>
              <Input
                id="qtdeEmbalagem"
                value={qtdeEmbalagem}
                onChange={(e) => setQtdeEmbalagem(e.target.value)}
                placeholder="Ex: 100ml, 500g, 10 unidades"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rendimento">Rendimento</Label>
              <Input
                id="rendimento"
                type="number"
                min="1"
                value={rendimento}
                onChange={(e) => setRendimento(e.target.value)}
                placeholder="Ex: 10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorFracionado">
              Valor Fracionado (R$)
              <span className="text-xs text-muted-foreground ml-1">(calculado com 10% de desconto)</span>
            </Label>
            <Input
              id="valorFracionado"
              type="number"
              step="0.01"
              min="0"
              value={valorFracionado}
              readOnly
              className="bg-gray-50"
              placeholder="Calculado automaticamente"
            />
          </div>

          <DialogFooter className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isDeleting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
