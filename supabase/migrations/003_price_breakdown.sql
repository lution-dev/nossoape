-- ══════════════════════════════════════════
-- Nosso Apê — Price Breakdown
-- Adiciona coluna JSONB para detalhamento de custos
-- ══════════════════════════════════════════

ALTER TABLE properties ADD COLUMN price_breakdown JSONB DEFAULT NULL;

-- Formato esperado:
-- {
--   "rent": 1380,       -- Aluguel
--   "condo": 288,       -- Condomínio
--   "iptu": 84,         -- IPTU
--   "insurance": 18,    -- Seguro incêndio
--   "tax": 35,          -- Taxa de serviço
--   "other": 0,         -- Outros custos
--   "total": 1805       -- Valor total mensal
-- }

COMMENT ON COLUMN properties.price_breakdown IS 'Detalhamento dos custos mensais do imóvel (aluguel, condomínio, IPTU, etc.)';
