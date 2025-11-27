-- Criar tabela para histórico de movimentações de estoque
CREATE TABLE IF NOT EXISTS historico_estoque (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade NUMERIC NOT NULL,
  quantidade_anterior NUMERIC NOT NULL,
  quantidade_nova NUMERIC NOT NULL,
  motivo TEXT,
  usuario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para consultas por material
CREATE INDEX IF NOT EXISTS idx_historico_material_id ON historico_estoque(material_id);

-- Criar índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_estoque(created_at DESC);

-- Comentário explicativo
COMMENT ON TABLE historico_estoque IS 'Histórico de todas as movimentações de estoque de materiais';
