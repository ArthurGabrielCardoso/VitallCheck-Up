import { AIAnalysisContent } from "../components/ai-analysis-content"

export const metadata = {
  title: "Análise Avançada - Dashboard",
  description: "Análise avançada dos dados de pesquisa de satisfação",
}

export default function AIAnalysisPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Análise Avançada</h1>
      <AIAnalysisContent />
    </div>
  )
}
