"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SpecialtyInterestsChartProps {
  specialtyCounts: Array<{
    specialty: string
    count: number
  }>
}

export function SpecialtyInterestsChart({ specialtyCounts }: SpecialtyInterestsChartProps) {
  // Format data for the bar chart
  const data = specialtyCounts
    .sort((a, b) => b.count - a.count) // Sort by count in descending order
    .map((item) => ({
      specialty: item.specialty,
      count: item.count,
      fill: "#c89d68",
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialidades de Interesse</CardTitle>
        <CardDescription>Especialidades mais solicitadas pelos pacientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="specialty" type="category" width={150} />
              <Tooltip
                formatter={(value) => [`${value} pacientes`, "Interesse"]}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <Legend />
              <Bar dataKey="count" name="Contagem" fill="#c89d68" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
