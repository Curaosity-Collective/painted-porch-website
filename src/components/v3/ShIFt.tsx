/**
 * The ShIFt wordmark with its emphasised, bold "IF", toned to the journey stage
 * it names. Ported from pps-simplified src/components/site/Nav.tsx.
 */
const shiftTones = {
  prepare: { light: "text-prepare-deep", dark: "text-prepare" },
  align: { light: "text-align-deep", dark: "text-align" },
  habits: { light: "text-habits-deep", dark: "text-habits" },
} as const;

export function ShIFt({
  tone,
  onDark = false,
  className = "",
}: {
  tone?: keyof typeof shiftTones;
  onDark?: boolean;
  className?: string;
}) {
  const color = tone ? shiftTones[tone][onDark ? "dark" : "light"] : onDark ? "text-berry-on-dark" : "text-berry";
  return (
    <>
      Sh
      <span className={`font-bold ${color} ${className}`}>IF</span>t
    </>
  );
}
