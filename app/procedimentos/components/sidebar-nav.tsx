"use client"

import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Package,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

const navigation = [
  {
    name: "Procedimentos",
    href: "/procedimentos",
    icon: LayoutGrid,
  },
  {
    name: "Materiais",
    href: "/procedimentos/materiais",
    icon: Package,
  },
  {
    name: "Registro Diário",
    href: "/procedimentos/registro-diario",
    icon: ClipboardList,
  },
  {
    name: "Lista de Compras",
    href: "/procedimentos/lista-compras",
    icon: ShoppingCart,
  },
  {
    name: "Precificação",
    href: "/procedimentos/precificacao",
    icon: DollarSign,
  },
  {
    name: "Relatórios",
    href: "/procedimentos/relatorios",
    icon: BarChart3,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState === "true") {
      setIsCollapsed(true)
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
    window.dispatchEvent(new Event("sidebar-toggle"))
  }

  const handleLogout = () => {
    localStorage.removeItem("procedimentos-token")
    window.location.href = "/procedimentos"
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md border-teal-200"
        >
          <Menu className="h-5 w-5 text-teal-700" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out lg:translate-x-0",
          "bg-gradient-to-b from-teal-700 via-teal-800 to-teal-900",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("p-4 border-b border-teal-600/30", isCollapsed && "px-2")}>
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">V</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-2">
                <Image
                  src="/vitall-logo.png"
                  alt="Vitall Odontologia"
                  width={160}
                  height={50}
                  className="object-contain brightness-0 invert"
                />
              </div>
            )}
          </div>

          {/* Collapse button - Desktop only */}
          <div className="hidden lg:flex justify-end p-2 border-b border-teal-600/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-8 w-8 p-0 text-teal-300 hover:text-white hover:bg-teal-600/50"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/procedimentos" && pathname?.startsWith(item.href))
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    isCollapsed && "justify-center px-2",
                    isActive
                      ? "bg-white/15 text-white shadow-lg backdrop-blur-sm border border-white/10"
                      : "text-teal-200 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-amber-400" : "text-teal-300",
                    )}
                  />
                  {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium bg-teal-800 text-white border-teal-700">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.name}>{linkContent}</div>
            })}
          </nav>

          {/* Footer - removido Dashboard Principal */}
          <div className={cn("p-3 border-t border-teal-600/30", isCollapsed && "px-2")}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-teal-800 text-white border-teal-700">
                  Sair
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </TooltipProvider>
  )
}

export function useSidebarWidth() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState === "true") {
      setIsCollapsed(true)
    }

    const handleStorage = () => {
      const state = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(state === "true")
    }

    window.addEventListener("storage", handleStorage)

    const handleCustom = () => {
      const state = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(state === "true")
    }
    window.addEventListener("sidebar-toggle", handleCustom)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("sidebar-toggle", handleCustom)
    }
  }, [])

  return isCollapsed ? 80 : 256
}
