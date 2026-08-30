export function CategoryProgressBar({
  done,
  total,
  isActive,
}: {
  done: number;
  total: number;
  isActive: boolean;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${done} sur ${total} emails traités dans cette catégorie`}
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
  );
}
