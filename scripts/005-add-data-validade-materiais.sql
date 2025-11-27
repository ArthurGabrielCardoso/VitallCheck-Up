-- Adicionar campo data_validade aos materiais
ALTER TABLE materiais ADD COLUMN IF NOT EXISTS data_validade DATE;

-- Adicionar campo valor (valor total do estoque)
ALTER TABLE materiais ADD COLUMN IF NOT EXISTS valor NUMERIC DEFAULT 0;

-- Atualizar valores existentes calculando valor total
UPDATE materiais SET valor = COALESCE(valor_fracionado * quantidade_estoque, 0) WHERE valor IS NULL OR valor = 0;
