"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Edit } from "lucide-react"
import type { SurveyResponse } from "@/lib/supabase"

interface SurveyResponseCardProps {
  response: SurveyResponse
  onUpdate: (id: number, updatedData: Partial<SurveyResponse>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function SurveyResponseCard({ response, onUpdate, onDelete }: SurveyResponseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedData, setEditedData] = useState<Partial<SurveyResponse>>({
    reception_rating: response.reception_rating,
    punctuality_rating: response.punctuality_rating,
    selected_dentist: response.selected_dentist,
    clinical_rating: response.clinical_rating,
    integrative_interest: response.integrative_interest,
    specialties: response.specialties || [],
    other_specialty: response.other_specialty || "",
    comments: response.comments || "",
  })

  const handleInputChange = (field: keyof SurveyResponse, value: any) => {
    setEditedData({ ...editedData, [field]: value })
  }

  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = editedData.specialties || []
    const updatedSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter((s) => s !== specialty)
      : [...currentSpecialties, specialty]

    setEditedData({ ...editedData, specialties: updatedSpecialties })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(response.id, editedData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating response:", error)
      alert("Erro ao atualizar resposta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(response.id)
      setIsDeleting(false)
    } catch (error) {
      console.error("Error deleting response:", error)
      alert("Erro ao excluir resposta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-gray-200 text-gray-200"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">Resposta #{response.id}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleting(true)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Enviado em: {format(new Date(response.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Recepção:</p>
              <div className="flex items-center">
                {renderStars(response.reception_rating)}
                <span className="ml-2">{response.reception_rating}/5</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Pontualidade:</p>
              <div className="flex items-center">
                {renderStars(response.punctuality_rating)}
                <span className="ml-2">{response.punctuality_rating}/5</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Dentista:</p>
              <p>{response.selected_dentist}</p>
            </div>
            <div>
              <p className="font-medium">Atendimento Clínico:</p>
              <div className="flex items-center">
                {renderStars(response.clinical_rating)}
                <span className="ml-2">{response.clinical_rating}/5</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Interesse em Saúde Integrativa:</p>
              <p>{response.integrative_interest ? "Sim" : "Não"}</p>
            </div>
            {response.specialties && response.specialties.length > 0 && (
              <div className="col-span-2">
                <p className="font-medium">Especialidades de interesse:</p>
                <ul className="list-disc list-inside">
                  {response.specialties.map((specialty, index) => (
                    <li key={index} className="text-xs">
                      {specialty}
                    </li>
                  ))}
                  {response.other_specialty && <li className="text-xs">Outro: {response.other_specialty}</li>}
                </ul>
              </div>
            )}
            {response.comments && (
              <div className="col-span-2">
                <p className="font-medium">Comentários:</p>
                <p className="text-gray-600 italic">{response.comments}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <p className="text-xs text-gray-400">IP: {response.ip_address || "Não registrado"}</p>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Resposta #{response.id}</DialogTitle>
            <DialogDescription>Faça as alterações necessárias e clique em salvar.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reception_rating">Avaliação da Recepção</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${editedData.reception_rating === rating ? "bg-primary text-white" : ""}`}
                    onClick={() => handleInputChange("reception_rating", rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="punctuality_rating">Avaliação da Pontualidade</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${editedData.punctuality_rating === rating ? "bg-primary text-white" : ""}`}
                    onClick={() => handleInputChange("punctuality_rating", rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="selected_dentist">Dentista</Label>
              <RadioGroup
                value={editedData.selected_dentist}
                onValueChange={(value) => handleInputChange("selected_dentist", value)}
                className="flex flex-col space-y-1"
              >
                {["Dra. Ana", "Dra. Marcela", "Dra. Juliana", "Dr. Pedro", "Outro / Não me lembro"].map((dentist) => (
                  <div key={dentist} className="flex items-center space-x-2">
                    <RadioGroupItem value={dentist} id={`dentist-${dentist}`} />
                    <Label htmlFor={`dentist-${dentist}`}>{dentist}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clinical_rating">Avaliação do Atendimento Clínico</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 ${editedData.clinical_rating === rating ? "bg-primary text-white" : ""}`}
                    onClick={() => handleInputChange("clinical_rating", rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Interesse em Saúde Integrativa</Label>
              <RadioGroup
                value={editedData.integrative_interest ? "yes" : "no"}
                onValueChange={(value) => handleInputChange("integrative_interest", value === "yes")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="interest-yes" />
                  <Label htmlFor="interest-yes">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="interest-no" />
                  <Label htmlFor="interest-no">Não</Label>
                </div>
              </RadioGroup>
            </div>

            {editedData.integrative_interest && (
              <div className="grid gap-2">
                <Label>Especialidades de Interesse</Label>
                <div className="grid gap-2">
                  {[
                    "Nutricionista",
                    "Fisioterapeuta",
                    "Psicólogo(a)",
                    "Médico(a)",
                    "Terapeuta Holístico / Alternativo",
                  ].map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={(editedData.specialties || []).includes(specialty)}
                        onCheckedChange={() => handleSpecialtyChange(specialty)}
                      />
                      <Label htmlFor={`specialty-${specialty}`}>{specialty}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="specialty-other"
                      checked={(editedData.specialties || []).includes("Outro")}
                      onCheckedChange={() => handleSpecialtyChange("Outro")}
                    />
                    <Label htmlFor="specialty-other">Outro</Label>
                  </div>

                  {(editedData.specialties || []).includes("Outro") && (
                    <Input
                      placeholder="Qual especialidade?"
                      value={editedData.other_specialty || ""}
                      onChange={(e) => handleInputChange("other_specialty", e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="comments">Comentários</Label>
              <Textarea
                id="comments"
                value={editedData.comments || ""}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir resposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
