"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DentistDistributionChartProps {
  dentistCounts: Array<{
    selected_dentist: string
    count: number
    avg_rating: number
  }>
}

export function DentistDistributionChart({ dentistCounts }: DentistDistributionChartProps) {
  // Format data for the pie chart
  const data = dentistCounts.map((item) => ({
    name: item.selected_dentist,
    value: item.count,
  }))

  // Define colors for each dentist
  const COLORS = ["#1db9b3", "#36b9cc", "#c89d68", "#4e73df", "#858796"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Dentista</CardTitle>
        <CardDescription>Número de avaliações por profissional</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} avaliações`, ""]}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
