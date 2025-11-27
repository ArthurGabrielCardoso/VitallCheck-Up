"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RatingsComparisonChartProps {
  receptionRating: number
  punctualityRating: number
  clinicalRating: number
}

export function RatingsComparisonChart({
  receptionRating,
  punctualityRating,
  clinicalRating,
}: RatingsComparisonChartProps) {
  const data = [
    {
      category: "Recepção",
      rating: receptionRating,
      fill: "#1db9b3",
    },
    {
      category: "Pontualidade",
      rating: punctualityRating,
      fill: "#36b9cc",
    },
    {
      category: "Atendimento Clínico",
      rating: clinicalRating,
      fill: "#c89d68",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Avaliações</CardTitle>
        <CardDescription>Média de avaliação por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 5]} />
              <Tooltip
                formatter={(value) => [`${value}/5`, "Avaliação"]}
                labelStyle={{ color: "#333" }}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <Legend />
              <Bar dataKey="rating" name="Média" radius={[4, 4, 0, 0]} fill="#1db9b3" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
