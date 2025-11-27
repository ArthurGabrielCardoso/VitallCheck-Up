"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Send, Users, MessageSquare, BarChart3 } from "lucide-react"

export default function WhatsAppDashboard() {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [messageTemplate, setMessageTemplate] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [campaignName, setCampaignName] = useState("")
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({ sent: 0, delivered: 0, read: 0, replied: 0 })

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Simulação de dados para demonstração
    setContacts([
      { id: 1, name: "João Silva", phone: "5511999999999" },
      { id: 2, name: "Maria Oliveira", phone: "5511888888888" },
      { id: 3, name: "Carlos Santos", phone: "5511777777777" },
    ])

    setCampaigns([
      { id: 1, name: "Campanha de Boas-vindas", status: "completed", sent: 150, delivered: 145, read: 120 },
      { id: 2, name: "Promoção Mensal", status: "in_progress", sent: 75, delivered: 70, read: 50 },
    ])

    setStats({ sent: 225, delivered: 215, read: 170, replied: 45 })
  }, [])

  const handleSendMessages = async () => {
    if (!messageTemplate || selectedContacts.length === 0 || !campaignName) {
      toast({
        title: "Informações incompletas",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulação de envio de mensagens
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Mensagens enviadas com sucesso",
        description: `${selectedContacts.length} mensagens foram enviadas.`,
      })

      // Atualizar estatísticas
      setStats((prev) => ({
        ...prev,
        sent: prev.sent + selectedContacts.length,
      }))

      // Limpar formulário
      setSelectedContacts([])
      setCampaignName("")
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagens",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAIMessage = async () => {
    setLoading(true)
    try {
      // Simulação de geração de mensagem com IA
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setMessageTemplate(
        "Olá {nome}, tudo bem? A Vitall Odontológica tem uma promoção especial para você! Agende sua consulta até o final do mês e ganhe 15% de desconto em procedimentos estéticos. Responda esta mensagem para mais informações.",
      )

      toast({
        title: "Mensagem gerada com IA",
        description: "Template de mensagem criado com sucesso.",
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard WhatsApp IA</h1>

      <Tabs defaultValue="nova-campanha">
        <TabsList className="mb-4">
          <TabsTrigger value="nova-campanha">Nova Campanha</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="nova-campanha">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Campanha</CardTitle>
                <CardDescription>Configure sua campanha de mensagens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nome da Campanha</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Promoção de Maio"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message-template">Modelo de Mensagem</Label>
                  <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" onClick={generateAIMessage} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Gerar com IA
                    </Button>
                  </div>
                  <Textarea
                    id="message-template"
                    placeholder="Digite sua mensagem. Use {nome} para personalizar."
                    rows={5}
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Selecionar Contatos</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os contatos</SelectItem>
                      <SelectItem value="clients">Clientes ativos</SelectItem>
                      <SelectItem value="prospects">Prospects</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedContacts.length > 0
                      ? `${selectedContacts.length} contatos selecionados`
                      : "Nenhum contato selecionado"}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleSendMessages}
                  disabled={loading || !messageTemplate || selectedContacts.length === 0 || !campaignName}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Enviar Mensagens
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prévia da Mensagem</CardTitle>
                <CardDescription>Visualize como sua mensagem será enviada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="bg-green-100 p-3 rounded-lg max-w-[80%] mb-4">
                    {messageTemplate ? messageTemplate.replace("{nome}", "João") : "Sua mensagem aparecerá aqui..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campanhas">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Histórico de campanhas enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          campaign.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {campaign.status === "completed" ? "Concluída" : "Em andamento"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Enviadas</p>
                        <p className="font-medium">{campaign.sent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Entregues</p>
                        <p className="font-medium">{campaign.delivered}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Lidas</p>
                        <p className="font-medium">{campaign.read}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contatos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Contatos</CardTitle>
              <CardDescription>Visualize e gerencie sua lista de contatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Input placeholder="Buscar contatos..." className="max-w-sm" />
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Importar Contatos
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{contact.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Send className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.sent}</p>
                  <p className="text-sm text-gray-500">Mensagens Enviadas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                  <p className="text-sm text-gray-500">Mensagens Entregues</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.read}</p>
                  <p className="text-sm text-gray-500">Mensagens Lidas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.replied}</p>
                  <p className="text-sm text-gray-500">Respostas Recebidas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho de Campanhas</CardTitle>
              <CardDescription>Análise de desempenho das últimas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Gráfico de desempenho seria exibido aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
