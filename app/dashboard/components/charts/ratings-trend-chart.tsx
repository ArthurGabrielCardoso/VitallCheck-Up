"use client"

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RatingsTrendChartProps {
  surveyResponses: Array<{
    submitted_at: string
    reception_rating: number
    punctuality_rating: number
    clinical_rating: number
  }>
}

export function RatingsTrendChart({ surveyResponses }: RatingsTrendChartProps) {
  // Group responses by date and calculate average ratings
  const groupedData = surveyResponses.reduce(
    (acc, response) => {
      const date = format(parseISO(response.submitted_at), "yyyy-MM-dd")

      if (!acc[date]) {
        acc[date] = {
          date,
          reception: response.reception_rating,
          punctuality: response.punctuality_rating,
          clinical: response.clinical_rating,
          count: 1,
        }
      } else {
        acc[date].reception += response.reception_rating
        acc[date].punctuality += response.punctuality_rating
        acc[date].clinical += response.clinical_rating
        acc[date].count += 1
      }

      return acc
    },
    {} as Record<string, { date: string; reception: number; punctuality: number; clinical: number; count: number }>,
  )

  // Calculate averages and format for chart
  const data = Object.values(groupedData)
    .map((item) => ({
      date: item.date,
      reception: Number.parseFloat((item.reception / item.count).toFixed(1)),
      punctuality: Number.parseFloat((item.punctuality / item.count).toFixed(1)),
      clinical: Number.parseFloat((item.clinical / item.count).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Avaliações</CardTitle>
        <CardDescription>Evolução das avaliações ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip
                formatter={(value) => [`${value}/5`, ""]}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="reception"
                name="Recepção"
                stroke="#1db9b3"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="punctuality" name="Pontualidade" stroke="#36b9cc" strokeWidth={2} />
              <Line type="monotone" dataKey="clinical" name="Atendimento Clínico" stroke="#c89d68" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
