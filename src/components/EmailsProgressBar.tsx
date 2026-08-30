import { useProcessingState } from "@/hooks/useProcessingState";

// Sticky offset matches the tab row's rendered height (px-6 py-2.5 text-xs buttons + border-b ≈ 40px).
const TAB_ROW_HEIGHT = 40;

export function EmailsProgressBar({ poll = true }: { poll?: boolean } = {}) {
  const { data: state } = useProcessingState(poll);

  const isActive = state?.is_active ?? false;
  const total = state?.total_emails ?? 0;
  const done = state?.processed_emails ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

  return (
    <div
      data-tour="progress-bar"
      className="px-6 py-2 flex-shrink-0 border-b border-border/30 bg-background"
      style={{ position: "sticky", top: TAB_ROW_HEIGHT, zIndex: 10 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
          {`${done}/${total} · ${percent}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${done} sur ${total} emails traités au total`}
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: isActive
              ? "linear-gradient(90deg, #f97316 0%, #ea580c 100%)"
              : "#8a3518",
            transition: "width 0.5s ease, background 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
