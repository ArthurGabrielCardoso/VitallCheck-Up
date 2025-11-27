"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Material } from "@/lib/supabase"

interface AddMaterialToProcedimentoProps {
  procedimentoId: number
  onSuccess: () => void
}

export function AddMaterialToProcedimento({ procedimentoId, onSuccess }: AddMaterialToProcedimentoProps) {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [quantidade, setQuantidade] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMateriais, setIsFetchingMateriais] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        const response = await fetch("/api/materiais")
        if (!response.ok) {
          throw new Error("Erro ao buscar materiais")
        }
        const data = await response.json()
        setMateriais(data)
      } catch (error) {
        console.error("Erro ao buscar materiais:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de materiais",
          variant: "destructive",
        })
      } finally {
        setIsFetchingMateriais(false)
      }
    }

    fetchMateriais()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMaterialId || !quantidade) {
      toast({
        title: "Erro",
        description: "Selecione um material e informe a quantidade",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/procedimento-material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          procedimento_id: procedimentoId,
          material_id: Number.parseInt(selectedMaterialId),
          quantidade: Number.parseFloat(quantidade),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao adicionar material ao procedimento")
      }

      toast({
        title: "Sucesso",
        description: "Material adicionado ao procedimento com sucesso",
      })

      // Limpar formulário
      setSelectedMaterialId("")
      setQuantidade("1")

      onSuccess()
    } catch (error) {
      console.error("Erro ao adicionar material ao procedimento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o material ao procedimento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Adicionar Material ao Procedimento</h3>

      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
        <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId} disabled={isFetchingMateriais}>
          <SelectTrigger id="material" className="w-full">
            <SelectValue placeholder="Selecione um material" />
          </SelectTrigger>
          <SelectContent>
            {materiais.map((material) => (
              <SelectItem key={material.id} value={material.id.toString()}>
                {material.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantidade">Quantidade</Label>
        <Input
          id="quantidade"
          type="number"
          step="0.01"
          min="0.01"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          placeholder="Quantidade"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading || isFetchingMateriais} className="w-full">
        {isLoading ? "Adicionando..." : "Adicionar Material"}
      </Button>
    </form>
  )
}
