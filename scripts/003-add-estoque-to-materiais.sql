-- Adicionar campos de controle de estoque aos materiais
ALTER TABLE materiais 
ADD COLUMN IF NOT EXISTS quantidade_estoque NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantidade_minima NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'unidade',
ADD COLUMN IF NOT EXISTS fornecedor TEXT,
ADD COLUMN IF NOT EXISTS ultima_compra DATE,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Criar índice para consultas de materiais em falta
CREATE INDEX IF NOT EXISTS idx_materiais_estoque_baixo 
ON materiais(quantidade_estoque, quantidade_minima) 
WHERE quantidade_estoque < quantidade_minima;

-- Comentários explicativos
COMMENT ON COLUMN materiais.quantidade_estoque IS 'Quantidade atual em estoque';
COMMENT ON COLUMN materiais.quantidade_minima IS 'Quantidade mínima para alerta de reposição';
COMMENT ON COLUMN materiais.unidade_medida IS 'Unidade: ml, g, unidade, caixa, etc';
COMMENT ON COLUMN materiais.fornecedor IS 'Nome do fornecedor principal';
COMMENT ON COLUMN materiais.ultima_compra IS 'Data da última compra realizada';
COMMENT ON COLUMN materiais.ativo IS 'Material ativo no sistema';
