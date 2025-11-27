"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface IntegrativeInterestChartProps {
  interestedPercentage: number
}

export function IntegrativeInterestChart({ interestedPercentage }: IntegrativeInterestChartProps) {
  const notInterestedPercentage = 100 - interestedPercentage

  const data = [
    { name: "Interessados", value: interestedPercentage, fill: "#1db9b3" },
    { name: "Não Interessados", value: notInterestedPercentage, fill: "#858796" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interesse em Saúde Integrativa</CardTitle>
        <CardDescription>Percentual de pacientes interessados em serviços integrativos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)}%`, ""]}
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
