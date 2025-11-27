"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteAllMateriaisButtonProps {
  onSuccess: () => void
}

export function DeleteAllMateriaisButton({ onSuccess }: DeleteAllMateriaisButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch("/api/materiais/delete-all", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao deletar materiais")
      }

      toast({
        title: "Sucesso!",
        description: "Todos os materiais foram removidos com sucesso.",
      })

      // Chamar a função de callback para atualizar a lista
      onSuccess()
    } catch (error) {
      console.error("Erro ao deletar materiais:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível deletar os materiais",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)} className="w-full">
        <Trash2 className="h-4 w-4 mr-2" />
        Apagar Todos os Materiais
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente todos os materiais do banco de dados e
              removerá todas as associações com procedimentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Apagando..." : "Sim, apagar todos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
