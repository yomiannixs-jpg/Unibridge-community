import { Flame, ShieldCheck, Star, Trophy } from "lucide-react";

export function KarmaBadge({ karma }: { karma: number }) {
  const tier =
    karma >= 1800
      ? { label: "Elite", icon: Trophy, style: "bg-yellow-50 text-yellow-800" }
      : karma >= 1000
        ? { label: "Expert", icon: ShieldCheck, style: "bg-emerald-50 text-emerald-800" }
        : karma >= 500
          ? { label: "Trusted", icon: Flame, style: "bg-blue-50 text-blue-800" }
          : { label: "Rising", icon: Star, style: "bg-slate-100 text-slate-700" };

  const Icon = tier.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${tier.style}`}>
      <Icon className="h-3 w-3" />
      {tier.label}
    </span>
  );
}
