-- Adicionar campos para cálculo de precificação aos procedimentos
ALTER TABLE procedimentos 
ADD COLUMN IF NOT EXISTS laboratorio NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS lucro_percent NUMERIC DEFAULT 20;

-- Comentários explicativos
COMMENT ON COLUMN procedimentos.laboratorio IS 'Valor do laboratório para este procedimento';
COMMENT ON COLUMN procedimentos.hr IS 'Quantidade de horas clínicas (HR) necessárias';
COMMENT ON COLUMN procedimentos.lucro_percent IS 'Percentual de lucro desejado (padrão 20%)';
