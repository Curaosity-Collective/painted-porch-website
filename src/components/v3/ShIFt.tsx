/**
 * The ShIFt wordmark. Its "IF" carries the logo-order brand blend (PPS Admin, 2026-11-24).
 * As a brand name the blend is exempt from contrast minimums (WCAG 2.2 SC 1.4.3; PPS Admin,
 * 2026-11-25: "How the font shows now is what's approved"; PPS-DEC-0022 item 6).
 * With `problem` it stays bold Raspberry (PPS-DEC-0022, item 6):
 *
 * - on light backgrounds: Raspberry (#DB0043)
 * - on dark backgrounds: a lighter raspberry so it stays readable. The light
 *   one (#FF9EB1) passes at every size on the site's dark teals; the bright one
 *   (`large`, #FF1F5A) only in large headings over very dark backgrounds such as
 *   a photo overlay
 * - on solid color fills (buttons, colored boxes): bold in the fill's own text
 *   color (`onFill`), because Raspberry on Gold or Lime can't be read
 *
 * `lowercase` renders "shIFt"; `plural` renders "ShIFts".
 */
export function ShIFt({
  onDark = false,
  large = false,
  onFill = false,
  lowercase = false,
  plural = false,
  problem = false,
  className = "",
}: {
  onDark?: boolean;
  large?: boolean;
  onFill?: boolean;
  lowercase?: boolean;
  plural?: boolean;
  /** The phrase frames a problem or cost: keep solid raspberry. */
  problem?: boolean;
  className?: string;
}) {
  const color = onFill
    ? ""
    : problem
      ? onDark
        ? large
          ? "text-raspberry-bright"
          : "text-berry-on-dark"
        : "text-raspberry"
      : onDark
        ? "if-blend"
        : "if-blend-light";
  return (
    // The wordmark is one word: never let a line break orphan the "t".
    <span className="whitespace-nowrap">
      {lowercase ? "sh" : "Sh"}
      <span className={`font-bold ${color} ${className}`.trim()}>IF</span>
      {plural ? "ts" : "t"}
    </span>
  );
}
