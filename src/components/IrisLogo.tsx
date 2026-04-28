export function IrisLogo({ className = "w-8 h-8" }: { className?: string }) {
  return <img src="/icon.png" alt="Iris" className={`object-contain ${className}`} />;
}
