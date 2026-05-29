export interface Achievement {
  achievement_key: string;
  unlocked_at: string;
}

export const ACHIEVEMENT_DEFS = [
  { key: "briefing_complete", emoji: "🎯", name: "Briefing Completo", desc: "Finalizou o briefing da marca" },
  { key: "first_content", emoji: "📅", name: "Primeiro Conteúdo", desc: "Primeiro roteiro gerado" },
  { key: "first_approval", emoji: "✅", name: "Primeira Aprovação", desc: "Aprovou o primeiro conteúdo" },
  { key: "campaigns_live", emoji: "🚀", name: "Campanhas no Ar", desc: "Onboarding chegou à fase de lançamento" },
  { key: "playbook_unlocked", emoji: "📖", name: "Playbook Desbloqueado", desc: "Playbook Comercial disponível" },
  { key: "3_months", emoji: "💜", name: "3 Meses Juntos", desc: "3 meses de parceria com a Viccari" },
  { key: "6_months", emoji: "🌟", name: "6 Meses Juntos", desc: "6 meses de parceria com a Viccari" },
  { key: "1_year", emoji: "🏆", name: "1 Ano Juntos", desc: "1 ano de parceria com a Viccari" },
  { key: "first_referral", emoji: "🤝", name: "Primeira Indicação", desc: "Registrou a primeira indicação" },
  { key: "referral_closed", emoji: "💸", name: "Indicação Fechada", desc: "Uma indicação virou cliente Viccari" },
] as const;
