-- Criar tabela para lista de compras
CREATE TABLE IF NOT EXISTS lista_compras (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materiais(id) ON DELETE CASCADE,
  quantidade_sugerida NUMERIC NOT NULL DEFAULT 1,
  quantidade_confirmada NUMERIC,
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'comprado', 'cancelado')),
  observacoes TEXT,
  data_necessidade DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lista_compras_status ON lista_compras(status);
CREATE INDEX IF NOT EXISTS idx_lista_compras_material ON lista_compras(material_id);
