"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ProcedimentoCard } from "./components/procedimento-card-new"
import { getEspecialidades } from "./components/especialidade-badge"
import { Plus, Search } from "lucide-react"
import type { Procedimento } from "@/lib/supabase"
import { Label } from "@/components/ui/label"

export default function ProcedimentosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [filteredProcedimentos, setFilteredProcedimentos] = useState<Procedimento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>("Todas")
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("procedimentos-token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProcedimentos()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterProcedimentos()
  }, [searchTerm, especialidadeFilter, procedimentos])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setAuthError("")

    try {
      if (email === "checkupodontologico1@gmail.com" && password === "admin1234") {
        localStorage.setItem("procedimentos-token", "authenticated")
        setIsAuthenticated(true)
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema de precificação",
        })
      } else {
        setAuthError("Credenciais inválidas")
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setAuthError("Ocorreu um erro ao fazer login")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const fetchProcedimentos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/procedimentos")
      if (!response.ok) {
        throw new Error("Erro ao buscar procedimentos")
      }
      const data = await response.json()
      setProcedimentos(data)
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os procedimentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterProcedimentos = () => {
    let filtered = procedimentos

    if (especialidadeFilter !== "Todas") {
      filtered = filtered.filter((proc) => (proc.especialidade || "Outros") === especialidadeFilter)
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (proc) =>
          proc.nome.toLowerCase().includes(lowerSearch) ||
          (proc.codigo && proc.codigo.toLowerCase().includes(lowerSearch)),
      )
    }

    setFilteredProcedimentos(filtered)
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <Card className="w-full max-w-md border-0 shadow-2xl shadow-teal-500/10">
          <div className="h-2 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 rounded-t-lg" />
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
              {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com busca e botão novo procedimento */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-gray-200 bg-white shadow-sm focus:border-teal-500 focus:ring-teal-500 rounded-xl"
            />
          </div>

          {/* Botão Novo Procedimento */}
          <Button
            onClick={() => router.push("/procedimentos/novo")}
            className="h-12 px-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25 rounded-xl gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Novo Procedimento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {/* Filtros de especialidade - abaixo da busca */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEspecialidadeFilter("Todas")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              especialidadeFilter === "Todas"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-500/25"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Todas
          </button>
          {getEspecialidades().map((esp) => (
            <button
              key={esp}
              onClick={() => setEspecialidadeFilter(esp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                especialidadeFilter === esp
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-500/25"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {esp}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Resultados */}
          {filteredProcedimentos.length > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                {filteredProcedimentos.length} procedimento{filteredProcedimentos.length !== 1 ? "s" : ""} encontrado
                {filteredProcedimentos.length !== 1 ? "s" : ""}
              </p>

              {/* Grid de cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProcedimentos.map((procedimento, index) => (
                  <div key={procedimento.id} className="animate-slide-in" style={{ animationDelay: `${index * 30}ms` }}>
                    <ProcedimentoCard procedimento={procedimento} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">Nenhum procedimento encontrado</p>
              <p className="text-sm text-gray-500">
                {searchTerm || especialidadeFilter !== "Todas"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando um novo procedimento"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
