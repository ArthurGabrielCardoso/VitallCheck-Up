export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Carregando dados do dashboard...</p>
    </div>
  )
}
