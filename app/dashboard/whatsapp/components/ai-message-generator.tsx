"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Sparkles } from "lucide-react"

export function AIMessageGenerator() {
  const [loading, setLoading] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [tone, setTone] = useState("")
  const [keywords, setKeywords] = useState("")
  const [generatedMessage, setGeneratedMessage] = useState("")

  const handleGenerateMessage = async () => {
    if (!purpose) {
      toast({
        title: "Propósito não definido",
        description: "Por favor, selecione o propósito da mensagem",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Aqui seria a chamada para a API de IA
      // Por enquanto, simulamos a geração
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Mensagens de exemplo baseadas no propósito
      const messages = {
        promocao:
          "Olá {nome}, tudo bem? A Vitall Odontológica tem uma promoção especial para você! Agende sua consulta até o final do mês e ganhe 15% de desconto em procedimentos estéticos. Responda esta mensagem para mais informações.",
        lembrete:
          "Olá {nome}, passando para lembrar que você tem uma consulta agendada na Vitall Odontológica para amanhã às 14h. Confirme sua presença respondendo esta mensagem. Estamos à disposição!",
        aniversario:
          "Olá {nome}, a equipe da Vitall Odontológica deseja um Feliz Aniversário! Como presente especial, você ganhou um check-up odontológico gratuito. Entre em contato para agendar sua avaliação.",
        feedback:
          "Olá {nome}, agradecemos por escolher a Vitall Odontológica para seus cuidados dentários. Gostaríamos de saber como foi sua experiência conosco. Poderia nos dar um feedback? Sua opinião é muito importante para melhorarmos nossos serviços.",
      }

      setGeneratedMessage(messages[purpose] || "Mensagem personalizada para você!")

      toast({
        title: "Mensagem gerada com sucesso",
        description: "A IA criou uma mensagem baseada nos seus parâmetros.",
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar mensagem",
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
        <CardTitle>Gerador de Mensagens com IA</CardTitle>
        <CardDescription>Use IA para criar mensagens personalizadas para seus contatos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="purpose">Propósito da Mensagem</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Selecione o propósito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promocao">Promoção</SelectItem>
              <SelectItem value="lembrete">Lembrete de Consulta</SelectItem>
              <SelectItem value="aniversario">Aniversário</SelectItem>
              <SelectItem value="feedback">Solicitação de Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tom da Mensagem</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue placeholder="Selecione o tom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="amigavel">Amigável</SelectItem>
              <SelectItem value="profissional">Profissional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Palavras-chave (opcional)</Label>
          <Input
            id="keywords"
            placeholder="Ex: desconto, promoção, agendamento"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <p className="text-sm text-gray-500">Separe as palavras-chave por vírgula</p>
        </div>

        {generatedMessage && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="generated-message">Mensagem Gerada</Label>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Textarea
                id="generated-message"
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={5}
                className="bg-transparent border-0 focus-visible:ring-0 p-0"
              />
            </div>
            <p className="text-sm text-gray-500">Você pode editar a mensagem gerada conforme necessário</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGenerateMessage} disabled={loading || !purpose}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Gerar Mensagem com IA
        </Button>
      </CardFooter>
    </Card>
  )
}
