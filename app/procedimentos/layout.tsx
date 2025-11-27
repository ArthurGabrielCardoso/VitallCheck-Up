"use client"

import type React from "react"
import { SidebarNav } from "./components/sidebar-nav"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function ProcedimentosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState === "true") {
      setIsCollapsed(true)
    }

    // Listener para mudanças na sidebar
    const handleStorageChange = () => {
      const state = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(state === "true")
    }

    window.addEventListener("storage", handleStorageChange)

    // Interval para checar mudanças locais
    const interval = setInterval(() => {
      const state = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(state === "true")
    }, 100)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Verificar se é login (client-side only)
  const isLoginPage = isClient && pathname === "/procedimentos" && !localStorage?.getItem("procedimentos-token")

  if (!isClient) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main
        className="min-h-screen transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? "5rem" : "18rem" }}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
