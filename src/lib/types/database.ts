export type UserRole = "admin" | "client";

export type OnboardingStatus =
  | "pendente"
  | "em_andamento"
  | "aguardando_cliente"
  | "concluido";

export type ContentFormat = "reels" | "stories" | "feed";

export type ContentStatus = "gerado" | "aprovado" | "reprovado";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string | null;
  instagram: string | null;
  slogan: string | null;
  cnpj: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  coverage: string | null;
  whatsapp: string | null;
  linktree: string | null;
  created_at: string;
}

export interface Niche {
  id: string;
  name: string;
  created_at: string;
}

export interface Subniche {
  id: string;
  niche_id: string;
  name: string;
  created_at: string;
}

export interface CompanyNiche {
  id: string;
  company_id: string;
  niche_id: string | null;
  subniche_id: string | null;
}

export interface BriefingAnswers {
  id: string;
  company_id: string;
  services: string | null;
  focus_product: string | null;
  target_audience: string | null;
  pains: string | null;
  desires: string | null;
  objections: string | null;
  content_goals: string[] | null;
  differentials: string | null;
  colors: string | null;
  font: string | null;
  design_style: string | null;
  brand_perception: string | null;
  forbidden_tone: string | null;
  instagram_references: string | null;
  brand_reputation: string | null;
  ad_budget: string | null;
  ad_platforms: string[] | null;
  extra_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface BigBrain {
  id: string;
  niche_id: string;
  subniche_id: string | null;
  content: string | null;
  updated_at: string;
}

export interface BrandBrain {
  id: string;
  company_id: string;
  tone_of_voice: string | null;
  language: string | null;
  archetype: string | null;
  dominant_emotion: string | null;
  cta_style: string | null;
  content_structure: string | null;
  communication_rules: string | null;
  forbidden_words: string | null;
  strategic_pillars: string[] | null;
  raw_output: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPhase {
  id: string;
  company_id: string;
  phase_number: number;
  phase_name: string;
  status: OnboardingStatus;
  deadline: string | null;
  completed_at: string | null;
  notes: string | null;
  updated_at: string;
}

export interface GeneratedContent {
  id: string;
  company_id: string;
  format: ContentFormat;
  pillar: string;
  title: string | null;
  hook: string | null;
  structure: string | null;
  script: string | null;
  caption: string | null;
  cta: string | null;
  status: ContentStatus;
  client_notes: string | null;
  scheduled_date: string | null;
  created_at: string;
}

export interface ContentCalendar {
  id: string;
  company_id: string;
  month: number;
  year: number;
  generated_at: string;
  total_contents: number;
}
