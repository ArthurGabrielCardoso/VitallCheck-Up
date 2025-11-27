"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { createClientSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function BulkDeleteButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      const supabase = createClientSupabaseClient()

      // Delete all records from the survey_responses table
      const { error } = await supabase.from("survey_responses").delete().neq("id", 0) // This condition will match all records

      if (error) throw new Error(error.message)

      toast({
        title: "Sucesso!",
        description: "Todas as respostas da pesquisa foram excluídas.",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Error deleting responses:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir respostas",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)} className="print:hidden">
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir Todas as Respostas
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir todas as respostas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as respostas da pesquisa do banco de
              dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleBulkDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
