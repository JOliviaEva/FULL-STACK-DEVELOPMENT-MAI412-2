export default function Button({ variant = "default", size, icon: Icon, className = "", children, ...props }) {
  const classes = ["uai-btn", `uai-btn--${variant}`, size && `uai-btn--${size}`, className].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} {...props}>
      {Icon && <Icon size={size === "sm" ? 13 : 15} strokeWidth={1.9} aria-hidden="true" />}
      {children}
    </button>
  );
}
