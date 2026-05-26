"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { ACHIEVEMENT_DEFS, type Achievement } from "@/lib/actions/achievements";

interface AchievementsBlockProps {
  unlocked: Achievement[];
  newlyUnlocked: string[];
}

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  round: boolean;
}

function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = ["#771FE3", "#8F68C1", "#a855f7", "#c084fc", "#e9d5ff"];
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        duration: 1.8 + Math.random() * 1.5,
        round: Math.random() > 0.4,
      }))
    );
    const t = setTimeout(() => setParticles([]), 3500);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <>
      <style>{`
        @keyframes viccari-fall {
          0%   { transform: translateY(0)   rotate(0deg)   scaleX(1); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translateY(85vh) rotate(520deg) scaleX(0.6); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: -12,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.round ? "50%" : 2,
              animation: `viccari-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function AchievementsBlock({ unlocked, newlyUnlocked }: AchievementsBlockProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [newlyUnlocked]);

  const unlockedMap = new Map(unlocked.map((a) => [a.achievement_key, a.unlocked_at]));

  return (
    <>
      <Confetti active={showConfetti} />

      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Conquistas</h2>
          <span className="text-xs text-white/30">
            {unlocked.length}/{ACHIEVEMENT_DEFS.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ACHIEVEMENT_DEFS.map(({ key, emoji, name, desc }) => {
            const unlockedAt = unlockedMap.get(key);
            const isUnlocked = !!unlockedAt;
            const isNew = newlyUnlocked.includes(key);

            return (
              <div
                key={key}
                title={isUnlocked ? `${desc} — ${new Date(unlockedAt!).toLocaleDateString("pt-BR")}` : desc}
                className={`relative flex flex-col items-center gap-2 rounded-xl p-3 border text-center transition-all ${
                  isNew
                    ? "border-[#771FE3]/60 bg-[#771FE3]/15 shadow-[0_0_18px_rgba(119,31,227,0.35)]"
                    : isUnlocked
                    ? "border-[#771FE3]/20 bg-[#771FE3]/5"
                    : "border-white/5 bg-white/[0.02] opacity-40"
                }`}
              >
                {isNew && (
                  <span className="absolute -top-2 -right-2 text-[10px] bg-[#771FE3] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
                    NOVO
                  </span>
                )}

                <span className={`text-2xl leading-none ${!isUnlocked ? "grayscale" : ""}`}>
                  {emoji}
                </span>

                <p className={`text-[11px] font-semibold leading-tight ${isUnlocked ? "text-white" : "text-white/40"}`}>
                  {name}
                </p>

                {isUnlocked ? (
                  <p className="text-[10px] text-white/30">
                    {new Date(unlockedAt!).toLocaleDateString("pt-BR")}
                  </p>
                ) : (
                  <Lock className="w-3 h-3 text-white/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
