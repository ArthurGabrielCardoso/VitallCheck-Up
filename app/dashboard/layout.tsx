"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const auth = localStorage.getItem("dashboard_auth")
    setIsAuthenticated(auth === "true")
    setIsLoading(false)

    // Se não estiver autenticado e não estiver na página de login, redirecionar
    if (auth !== "true" && pathname !== "/dashboard/login") {
      router.push("/dashboard/login")
    }
  }, [pathname, router])

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem("dashboard_auth")
    setIsAuthenticated(false)
    router.push("/dashboard/login")
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Verificando autenticação...</p>
      </div>
    )
  }

  // Se estiver na página de login, mostrar o componente de login
  if (pathname === "/dashboard/login") {
    return children
  }

  // Se não estiver autenticado, não mostrar nada (o redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null
  }

  // Verificar se está na página principal do dashboard ou em outras páginas
  const isMainDashboard = pathname === "/dashboard"
  const isManagePage = pathname === "/dashboard/manage"
  const isAnamnesePage = pathname === "/dashboard/anamnese"
  const isProcedimentosPage = pathname === "/dashboard/procedimentos"

  // Se estiver autenticado, mostrar o dashboard com botão de logout
  return (
    <div>
      {/* Barra superior com navegação e botão de logout */}
      <div className="bg-white shadow-sm py-2 px-4 flex justify-between items-center">
        <div className="flex space-x-4">
          {!isMainDashboard && (
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              Dashboard Principal
            </Link>
          )}
          {!isManagePage && (
            <Link href="/dashboard/manage" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              Gerenciar Respostas
            </Link>
          )}
          {!isAnamnesePage && (
            <Link href="/dashboard/anamnese" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              Anamneses
            </Link>
          )}
          {pathname !== "/dashboard/procedimentos" && (
            <Link
              href="/dashboard/procedimentos"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              Procedimentos
            </Link>
          )}
          {pathname !== "/dashboard/whatsapp" && (
            <Link href="/dashboard/whatsapp" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              WhatsApp IA
            </Link>
          )}
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sair
        </button>
      </div>

      {/* Conteúdo do dashboard */}
      {children}
    </div>
  )
}
