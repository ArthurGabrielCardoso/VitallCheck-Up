-- Adicionar campo de especialidade aos procedimentos
ALTER TABLE procedimentos 
ADD COLUMN IF NOT EXISTS especialidade TEXT DEFAULT 'Outros';

-- Criar índice para melhorar performance nas queries por especialidade
CREATE INDEX IF NOT EXISTS idx_procedimentos_especialidade ON procedimentos(especialidade);

-- Comentário explicativo
COMMENT ON COLUMN procedimentos.especialidade IS 'Especialidade odontológica: Cirurgia, Dentística, Endodontia, Periodontia, Ortodontia, Prótese, Outros';
