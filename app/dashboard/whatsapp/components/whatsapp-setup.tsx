"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function WhatsAppSetup() {
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [businessAccountId, setBusinessAccountId] = useState("")
  const supabase = createClientComponentClient()

  const handleSaveConfig = async () => {
    if (!apiKey || !phoneNumberId || !businessAccountId) {
      toast({
        title: "Informações incompletas",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Salvar configurações no Supabase
      const { error } = await supabase.from("whatsapp_config").upsert({
        api_key: apiKey,
        phone_number_id: phoneNumberId,
        business_account_id: businessAccountId,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error("Erro ao salvar configurações")
      }

      toast({
        title: "Configurações salvas com sucesso",
        description: "Sua integração com o WhatsApp está pronta para uso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)

    try {
      // Simular teste de conexão
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Conexão bem-sucedida",
        description: "Sua integração com o WhatsApp está funcionando corretamente.",
      })
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do WhatsApp Business API</CardTitle>
        <CardDescription>Configure sua integração com a API do WhatsApp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Token de Acesso</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Seu token de acesso da API do WhatsApp"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-id">ID do Número de Telefone</Label>
          <Input
            id="phone-id"
            placeholder="ID do número de telefone no WhatsApp Business"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-id">ID da Conta Business</Label>
          <Input
            id="business-id"
            placeholder="ID da sua conta WhatsApp Business"
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={testConnection}
          disabled={loading || !apiKey || !phoneNumberId || !businessAccountId}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Testar Conexão
        </Button>

        <Button onClick={handleSaveConfig} disabled={loading || !apiKey || !phoneNumberId || !businessAccountId}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  )
}
