import { getLevelInfo } from "@/lib/gamification";

export function LevelBadge({ xp, size = "sm" }: { xp: number; size?: "sm" | "md" | "lg" }) {
  const info = getLevelInfo(xp);
  const sizeClasses = {
    sm: "size-6 text-xs",
    md: "size-8 text-sm",
    lg: "size-10 text-base",
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-500 to-rose-500 text-white grid place-items-center font-extrabold shadow-sm`}
      title={`Level ${info.level} · ${info.title} · ${xp} XP`}
    >
      {info.level}
    </div>
  );
}
