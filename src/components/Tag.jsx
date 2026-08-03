const PALETTE = ["blue", "pink", "yellow", "green"];

export default function Tag({ children, index = 0 }) {
  const variant = PALETTE[index % PALETTE.length];
  return (
    <span
      className="tag-pill"
      style={{
        background: `var(--pill-${variant}-bg)`,
        color: `var(--pill-${variant}-text)`,
      }}
    >
      {children}
    </span>
  );
}
