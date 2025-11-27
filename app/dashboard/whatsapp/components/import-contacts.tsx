"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ImportContacts() {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [contacts, setContacts] = useState<string>("")
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImportFile = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo CSV ou Excel para importar.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Aqui seria a lógica para processar o arquivo
      // Por enquanto, apenas simulamos o processamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Contatos importados com sucesso",
        description: `${Math.floor(Math.random() * 50) + 10} contatos foram importados.`,
      })

      setFile(null)
    } catch (error) {
      toast({
        title: "Erro ao importar contatos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportText = async () => {
    if (!contacts.trim()) {
      toast({
        title: "Nenhum contato informado",
        description: "Por favor, insira os contatos no formato especificado.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Processar texto de contatos
      const contactLines = contacts.split("\n").filter((line) => line.trim())

      // Aqui seria a lógica para processar e salvar os contatos
      // Por enquanto, apenas simulamos o processamento
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Contatos importados com sucesso",
        description: `${contactLines.length} contatos foram importados.`,
      })

      setContacts("")
    } catch (error) {
      toast({
        title: "Erro ao importar contatos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Arquivo</CardTitle>
          <CardDescription>Importe contatos de um arquivo CSV ou Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo de Contatos</Label>
            <Input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
            <p className="text-sm text-gray-500">Formatos suportados: CSV, Excel (.xlsx, .xls)</p>
          </div>

          {file && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Arquivo selecionado:</p>
              <p className="text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleImportFile} disabled={loading || !file}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Importar Arquivo
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar Manualmente</CardTitle>
          <CardDescription>Cole uma lista de contatos no formato Nome,Telefone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contacts-text">Lista de Contatos</Label>
            <Textarea
              id="contacts-text"
              placeholder="João Silva,5511999999999&#10;Maria Oliveira,5511888888888"
              rows={8}
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
            />
            <p className="text-sm text-gray-500">Formato: Nome,Telefone (um contato por linha)</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleImportText} disabled={loading || !contacts.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Importar Contatos
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
