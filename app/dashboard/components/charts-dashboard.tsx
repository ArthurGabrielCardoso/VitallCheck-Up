"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AIAnalysisButton } from "./ai-analysis-button"
import { BulkDeleteButton } from "./bulk-delete-button"
import { ExportDataButton } from "./export-data-button"

export function ChartsDashboard({ dashboardData }) {
  const { surveyResponses, statistics, dentistCounts, specialtyCounts } = dashboardData || {
    surveyResponses: [],
    statistics: {
      avg_reception_rating: 0,
      avg_punctuality_rating: 0,
      avg_clinical_rating: 0,
      integrative_interest_percentage: 0,
      total_responses: 0,
    },
    dentistCounts: [],
    specialtyCounts: [],
  }

  // Prepare data for ratings comparison chart
  const ratingsData = [
    {
      category: "Recepção",
      rating: statistics.avg_reception_rating,
      fill: "#1db9b3",
    },
    {
      category: "Pontualidade",
      rating: statistics.avg_punctuality_rating,
      fill: "#36b9cc",
    },
    {
      category: "Atendimento Clínico",
      rating: statistics.avg_clinical_rating,
      fill: "#c89d68",
    },
  ]

  // Prepare data for dentist distribution chart
  const dentistData = dentistCounts.map((item) => ({
    name: item.selected_dentist,
    value: item.count,
  }))

  // Prepare data for specialty interests chart
  const specialtyData = specialtyCounts
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      specialty: item.specialty,
      count: item.count,
      fill: "#c89d68",
    }))

  // Prepare data for integrative interest chart
  const integrativeData = [
    { name: "Interessados", value: statistics.integrative_interest_percentage, fill: "#1db9b3" },
    { name: "Não Interessados", value: 100 - statistics.integrative_interest_percentage, fill: "#858796" },
  ]

  // Define colors for pie charts
  const COLORS = ["#1db9b3", "#36b9cc", "#c89d68", "#4e73df", "#858796"]

  // Group responses by date for trend chart
  const dateGroups: Record<
    string,
    { date: string; reception: number; punctuality: number; clinical: number; count: number }
  > = {}

  surveyResponses.forEach((response) => {
    if (!response.submitted_at) return

    const date = new Date(response.submitted_at).toISOString().split("T")[0]

    if (!dateGroups[date]) {
      dateGroups[date] = {
        date,
        reception: response.reception_rating || 0,
        punctuality: response.punctuality_rating || 0,
        clinical: response.clinical_rating || 0,
        count: 1,
      }
    } else {
      dateGroups[date].reception += response.reception_rating || 0
      dateGroups[date].punctuality += response.punctuality_rating || 0
      dateGroups[date].clinical += response.clinical_rating || 0
      dateGroups[date].count += 1
    }
  })

  const trendData = Object.values(dateGroups)
    .map((item) => ({
      date: item.date,
      reception: Number.parseFloat((item.reception / item.count).toFixed(1)),
      punctuality: Number.parseFloat((item.punctuality / item.count).toFixed(1)),
      clinical: Number.parseFloat((item.clinical / item.count).toFixed(1)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("pt-BR"),
    }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex space-x-2">
          <AIAnalysisButton />
          <ExportDataButton />
          <BulkDeleteButton />
        </div>
      </div>

      {/* Ratings Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Avaliações</CardTitle>
          <CardDescription>Média de avaliação por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  formatter={(value) => [`${value}/5`, "Avaliação"]}
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <Legend />
                <Bar dataKey="rating" name="Média" radius={[4, 4, 0, 0]} fill="#1db9b3" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dentist Distribution Chart */}
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
                  data={dentistData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dentistData.map((entry, index) => (
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

      {/* Specialty Interests Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Especialidades de Interesse</CardTitle>
          <CardDescription>Especialidades mais solicitadas pelos pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyData} layout="vertical">
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

      {/* Integrative Interest Chart */}
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
                  data={integrativeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {integrativeData.map((entry, index) => (
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

      {/* Ratings Trend Chart */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Avaliações</CardTitle>
            <CardDescription>Evolução das avaliações ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
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
                  <Line
                    type="monotone"
                    dataKey="clinical"
                    name="Atendimento Clínico"
                    stroke="#c89d68"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
