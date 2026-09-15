export default function Divider({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-paper-line" />
      <span className="h-1.5 w-1.5 rotate-45 border border-plum-400/60" />
      <span className="h-px flex-1 bg-paper-line" />
    </div>
  );
}
