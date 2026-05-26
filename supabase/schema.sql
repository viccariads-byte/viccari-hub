-- ============================================================
-- VICCARI HUB — Schema SQL para Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de perfis (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabela de empresas / clientes
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  instagram TEXT,
  slogan TEXT,
  cnpj TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  coverage TEXT,
  whatsapp TEXT,
  linktree TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Nichos
CREATE TABLE IF NOT EXISTS public.niches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subnichos
CREATE TABLE IF NOT EXISTS public.subniches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_id UUID REFERENCES public.niches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Nicho do cliente
CREATE TABLE IF NOT EXISTS public.company_niche (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  niche_id UUID REFERENCES public.niches(id),
  subniche_id UUID REFERENCES public.subniches(id),
  UNIQUE(company_id)
);

-- 6. Respostas do briefing
CREATE TABLE IF NOT EXISTS public.briefing_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  services TEXT,
  focus_product TEXT,
  target_audience TEXT,
  pains TEXT,
  desires TEXT,
  objections TEXT,
  content_goals TEXT[],
  differentials TEXT,
  colors TEXT,
  font TEXT,
  design_style TEXT,
  brand_perception TEXT,
  forbidden_tone TEXT,
  instagram_references TEXT,
  brand_reputation TEXT,
  ad_budget TEXT,
  ad_platforms TEXT[],
  extra_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Big Brain por nicho
CREATE TABLE IF NOT EXISTS public.big_brain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_id UUID REFERENCES public.niches(id) ON DELETE CASCADE NOT NULL,
  subniche_id UUID REFERENCES public.subniches(id) ON DELETE CASCADE,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Brand Brain por cliente
CREATE TABLE IF NOT EXISTS public.brand_brain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tone_of_voice TEXT,
  language TEXT,
  archetype TEXT,
  dominant_emotion TEXT,
  cta_style TEXT,
  content_structure TEXT,
  communication_rules TEXT,
  forbidden_words TEXT,
  strategic_pillars TEXT[],
  raw_output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Fases de onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'aguardando_cliente', 'concluido')),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Conteúdos gerados
CREATE TABLE IF NOT EXISTS public.generated_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('reels', 'stories', 'feed')),
  pillar TEXT NOT NULL,
  title TEXT,
  hook TEXT,
  structure TEXT,
  script TEXT,
  caption TEXT,
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'gerado' CHECK (status IN ('gerado', 'aprovado', 'reprovado')),
  client_notes TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Calendário mensal
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  total_contents INTEGER DEFAULT 0,
  UNIQUE(company_id, month, year)
);

-- 12. Logs de prompts
CREATE TABLE IF NOT EXISTS public.prompt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  prompt_type TEXT,
  input TEXT,
  output TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_niche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subniches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.big_brain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_brain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário lê o próprio perfil; admin lê todos
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Companies: cliente lê/edita a própria; admin lê/edita todas
CREATE POLICY "companies_client_own" ON public.companies
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "companies_admin_all" ON public.companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Niches/Subniches: todos autenticados leem; só admin escreve
CREATE POLICY "niches_read" ON public.niches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "niches_admin_write" ON public.niches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "subniches_read" ON public.subniches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "subniches_admin_write" ON public.subniches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Briefing, Brand Brain, Onboarding, Conteúdos: cliente lê o próprio; admin lê todos
CREATE POLICY "briefing_client_own" ON public.briefing_answers
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "briefing_admin_all" ON public.briefing_answers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "brand_brain_client_own" ON public.brand_brain
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "brand_brain_admin_all" ON public.brand_brain
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "onboarding_client_own" ON public.onboarding_phases
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "onboarding_admin_all" ON public.onboarding_phases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "contents_client_own" ON public.generated_contents
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "contents_admin_all" ON public.generated_contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "calendar_client_own" ON public.content_calendar
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "calendar_admin_all" ON public.content_calendar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Dados iniciais de nichos (exemplo)
-- ============================================================

INSERT INTO public.niches (name) VALUES
  ('Agências de Viagem'),
  ('Clínicas de Estética'),
  ('Odontologia'),
  ('Alimentação e Gastronomia'),
  ('Moda e Vestuário'),
  ('Saúde e Bem-estar'),
  ('Advocacia'),
  ('Imobiliário'),
  ('Educação'),
  ('Pets')
ON CONFLICT DO NOTHING;
