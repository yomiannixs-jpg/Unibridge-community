import { presenceDotClass, presenceLabel, lastSeenLabel, type PresenceStatus } from "@/lib/presence-store";

export function PresenceBadge({
  status = "offline",
  lastSeen,
  showText = true,
}: {
  status?: PresenceStatus;
  lastSeen?: string;
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
      <span className={`h-2.5 w-2.5 rounded-full ${presenceDotClass(status)}`} />
      {showText ? presenceLabel(status) : null}
      {lastSeen && status !== "online" ? <span className="text-slate-400">· {lastSeenLabel(lastSeen)}</span> : null}
    </span>
  );
}

export function PresenceDot({ status = "offline" }: { status?: PresenceStatus }) {
  return <span className={`h-3 w-3 rounded-full border-2 border-white ${presenceDotClass(status)}`} />;
}
