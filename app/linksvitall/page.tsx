import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LinksVitallPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-2 border-secondary">
        <div className="mb-6">
          <Image src="/logo.png" alt="Vitall Check-Up Logo" width={180} height={90} className="mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-6">Vitall Check-up</h1>

        <div className="space-y-4">
          <Link href="/forms" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">Iniciar Pesquisa de Satisfação</Button>
          </Link>

          <Link href="/anamnese" className="block">
            <Button className="w-full bg-secondary hover:bg-secondary/90">Preencher Anamnese Clínica</Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Vitall Check-up. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
