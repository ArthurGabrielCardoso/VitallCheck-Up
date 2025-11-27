import { createClient } from "@supabase/supabase-js"

// Tipos para as tabelas do Supabase
export type SurveyResponse = {
  id: number
  submitted_at: string
  reception_rating: number
  punctuality_rating: number
  selected_dentist: string
  clinical_rating: number
  integrative_interest: boolean
  specialties: string[] | null
  other_specialty: string | null
  comments: string | null
  created_at: string
  ip_address: string | null
}

export type SurveyStatistics = {
  total_responses: number
  avg_reception_rating: number
  avg_punctuality_rating: number
  avg_clinical_rating: number
  integrative_interest_percentage: number
}

export type DentistCount = {
  selected_dentist: string
  count: number
  avg_rating: number
}

export type SpecialtyCount = {
  specialty: string
  count: number
}

export type Procedimento = {
  id: number
  codigo: string
  nome: string
  valor: number
  especialidade?: string
  laboratorio?: number
  hr?: number
  lucro_percent?: number
  custo_materiais?: number // Added optional field for calculated cost
}

export type Material = {
  id: number
  nome: string
  valor_embalagem: number
  qtde_embalagem: string
  rendimento: string
  valor_fracionado: number
  quantidade_estoque?: number
  quantidade_minima?: number
  unidade_medida?: string
  fornecedor?: string
  ultima_compra?: string
  ativo?: boolean
  data_validade?: string // Added data_validade field
  valor?: number // Added valor (total stock value) field
}

export type ProcedimentoMaterial = {
  id: number
  procedimento_id: number
  material_id: number
  quantidade: number
  material?: Material
}

export type HistoricoEstoque = {
  id: number
  material_id: number
  tipo: "entrada" | "saida" | "ajuste"
  quantidade: number
  quantidade_anterior: number
  quantidade_nova: number
  motivo?: string
  usuario?: string
  created_at: string
}

export type ListaCompras = {
  id: number
  material_id: number
  quantidade_sugerida: number
  quantidade_confirmada?: number
  prioridade: "baixa" | "normal" | "alta" | "urgente"
  status: "pendente" | "aprovado" | "comprado" | "cancelado"
  observacoes?: string
  data_necessidade?: string
  created_at: string
  updated_at: string
  material?: Material
}

export type RegistroProcedimento = {
  id: number
  data: string
  procedimento_id: number
  quantidade: number
  observacoes?: string
  baixa_estoque_realizada: boolean
  created_at: string
  updated_at: string
  procedimento?: Procedimento
}

export type BaixaEstoqueProcedimento = {
  id: number
  registro_procedimento_id: number
  material_id: number
  quantidade_baixada: number
  quantidade_anterior: number
  quantidade_nova: number
  created_at: string
  material?: Material
}

// Re-exportar createClient para compatibilidade
export { createClient }

// Criação do cliente Supabase para o servidor
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Singleton para o cliente Supabase no lado do cliente
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL or Anon Key not defined")
    throw new Error("Supabase credentials not available")
  }

  clientSupabaseInstance = createClient(supabaseUrl, supabaseKey)
  return clientSupabaseInstance
}
