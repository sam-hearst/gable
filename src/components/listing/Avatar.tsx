// A round initial in a warm or green color picked from the name, like the
// avatars in the Messages design.
const COLORS = ["#C4622D", "#2B7A4B", "#1D5C37", "#9A5B2E", "#3F6B58"];

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % COLORS.length;
  return (
    <span
      className="cm-avatar"
      style={{ width: size, height: size, background: COLORS[h], fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
