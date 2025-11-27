"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Check, Package, ChevronDown } from "lucide-react"
import type { Material } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface MaterialDropdownProps {
  value: string
  onChange: (value: string) => void
  procedimentoId: number
  disabled?: boolean
}

export function MaterialDropdown({ value, onChange, procedimentoId, disabled = false }: MaterialDropdownProps) {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMateriais()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchMateriais = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/materiais")
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setMateriais(data)
      } else {
        toast({
          title: "Erro",
          description: "Formato de dados inválido ao carregar materiais",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("MaterialDropdown: Erro ao buscar materiais:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de materiais",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const selectedMaterial = materiais.find((m) => m.id.toString() === value)

  const filteredMateriais = materiais.filter((m) => m.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelect = (materialId: string) => {
    onChange(materialId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const getEstoqueStatus = (material: Material) => {
    const estoque = material.quantidade_estoque || 0
    const minimo = material.quantidade_minima || 10
    const percentual = minimo > 0 ? (estoque / minimo) * 100 : 100

    if (percentual < 50) return { color: "text-red-500 bg-red-50", label: "Crítico" }
    if (percentual < 100) return { color: "text-amber-500 bg-amber-50", label: "Baixo" }
    return { color: "text-green-500 bg-green-50", label: "OK" }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200",
          "bg-white hover:border-teal-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
          isOpen ? "border-teal-500 ring-2 ring-teal-500/20" : "border-gray-200",
          disabled && "opacity-50 cursor-not-allowed",
          isLoading && "animate-pulse",
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-lg", selectedMaterial ? "bg-teal-50" : "bg-gray-100")}>
            <Package className={cn("h-4 w-4", selectedMaterial ? "text-teal-600" : "text-gray-400")} />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-gray-400">Carregando...</span>
            </div>
          ) : selectedMaterial ? (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-gray-900 truncate">{selectedMaterial.nome}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(selectedMaterial.valor_fracionado)} / {selectedMaterial.unidade_medida || "un"}
              </p>
            </div>
          ) : (
            <span className="text-gray-400">Selecione um material</span>
          )}
        </div>

        <ChevronDown
          className={cn("h-5 w-5 text-gray-400 transition-transform duration-200", isOpen && "transform rotate-180")}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                autoFocus
              />
            </div>
          </div>

          {/* Materials List */}
          <div className="max-h-72 overflow-y-auto">
            {filteredMateriais.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">Nenhum material encontrado</p>
                <p className="text-sm">Tente outro termo de busca</p>
              </div>
            ) : (
              <div className="py-1">
                {filteredMateriais.map((material) => {
                  const isSelected = material.id.toString() === value
                  const status = getEstoqueStatus(material)

                  return (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => handleSelect(material.id.toString())}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
                        "hover:bg-teal-50",
                        isSelected && "bg-teal-50",
                      )}
                    >
                      {/* Selection Indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          isSelected ? "border-teal-500 bg-teal-500" : "border-gray-300",
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>

                      {/* Material Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium truncate", isSelected ? "text-teal-700" : "text-gray-900")}>
                            {material.nome}
                          </p>
                          {/* Stock Status Badge */}
                          <span
                            className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", status.color)}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="font-medium text-teal-600">{formatCurrency(material.valor_fracionado)}</span>
                          <span className="text-gray-300">•</span>
                          <span>
                            Estoque: {material.quantidade_estoque || 0} {material.unidade_medida || "un"}
                          </span>
                          {material.rendimento && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Rende: {material.rendimento}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer with Reload */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchMateriais}
              className="w-full text-gray-600 hover:text-teal-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar lista
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
