-- ============================================================
-- VICCARI HUB — Migration Etapa 9: Playbook Comercial
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 13. Conteúdo do Playbook por nicho (alimentado pelo admin)
CREATE TABLE IF NOT EXISTS public.playbook_niche_content (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_id      UUID REFERENCES public.niches(id) ON DELETE CASCADE NOT NULL,
  subniche_id   UUID REFERENCES public.subniches(id) ON DELETE CASCADE,

  -- Perguntas SPIN organizadas por etapa
  -- Estrutura esperada:
  -- {
  --   "situacao":    ["Pergunta 1", "Pergunta 2", ...],
  --   "problema":    ["Pergunta 1", ...],
  --   "implicacao":  ["Pergunta 1", ...],
  --   "necessidade": ["Pergunta 1", ...]
  -- }
  spin_questions    JSONB DEFAULT '{}',

  -- Objeções com diagnóstico e resposta
  -- Estrutura esperada:
  -- [
  --   {
  --     "objection": "Tá caro",
  --     "diagnosis": "...",
  --     "response":  "...",
  --     "tone":      "..."
  --   },
  --   ...
  -- ]
  objection_scripts JSONB DEFAULT '[]',

  -- Templates de follow-up por trilha
  -- Estrutura esperada:
  -- {
  --   "quente": [{ "label": "FUP 1 — 2h depois", "message": "..." }, ...],
  --   "frio":   [{ "label": "FUP 1 — 24h depois", "message": "..." }, ...],
  --   "nunca":  [{ "label": "FUP 1 — 48h depois", "message": "..." }, ...]
  -- }
  fup_templates     JSONB DEFAULT '{}',

  -- Benchmarks do nicho
  -- Estrutura esperada:
  -- [
  --   { "metric": "Taxa de resposta média", "value": "68%", "note": "..." },
  --   ...
  -- ]
  kpis_reference    JSONB DEFAULT '[]',

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um registro por combinação nicho/subnicho
  UNIQUE (niche_id, subniche_id)
);

-- 14. Checklists de atendimento por cliente
CREATE TABLE IF NOT EXISTS public.sales_checklists (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  attendant_name  TEXT,

  -- Estado do checklist salvo pelo vendedor
  -- Estrutura esperada:
  -- {
  --   "steps": [
  --     { "id": "primeiro_contato", "label": "Primeiro contato feito", "checked": true },
  --     ...
  --   ],
  --   "notes": "observação livre"
  -- }
  checklist_data  JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.playbook_niche_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_checklists       ENABLE ROW LEVEL SECURITY;

-- playbook_niche_content: qualquer usuário autenticado lê; só admin escreve
CREATE POLICY "playbook_read_authenticated" ON public.playbook_niche_content
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "playbook_admin_write" ON public.playbook_niche_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- sales_checklists: cliente lê/escreve os registros da própria empresa; admin lê todos
CREATE POLICY "checklists_client_own" ON public.sales_checklists
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "checklists_admin_read" ON public.sales_checklists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
