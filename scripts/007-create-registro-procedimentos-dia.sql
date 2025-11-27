-- Criar tabela para registro de procedimentos realizados por dia
CREATE TABLE IF NOT EXISTS registro_procedimentos (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  procedimento_id INTEGER REFERENCES procedimentos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT,
  baixa_estoque_realizada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para log de baixas de estoque por procedimento
CREATE TABLE IF NOT EXISTS baixa_estoque_procedimento (
  id SERIAL PRIMARY KEY,
  registro_procedimento_id INTEGER REFERENCES registro_procedimentos(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materiais(id) ON DELETE SET NULL,
  quantidade_baixada NUMERIC NOT NULL,
  quantidade_anterior NUMERIC NOT NULL,
  quantidade_nova NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_registro_procedimentos_data ON registro_procedimentos(data);
CREATE INDEX IF NOT EXISTS idx_registro_procedimentos_procedimento ON registro_procedimentos(procedimento_id);
CREATE INDEX IF NOT EXISTS idx_baixa_estoque_registro ON baixa_estoque_procedimento(registro_procedimento_id);
