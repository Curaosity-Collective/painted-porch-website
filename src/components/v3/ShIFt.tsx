/**
 * The ShIFt wordmark. Its "IF" is always bold Raspberry (PPS-DEC-0022, item 6):
 *
 * - on light backgrounds: Raspberry (#DB0043)
 * - on dark backgrounds: a lighter raspberry so it stays readable, the bright
 *   one in large headings (`large`) and the light one in body-size text
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
  className = "",
}: {
  onDark?: boolean;
  large?: boolean;
  onFill?: boolean;
  lowercase?: boolean;
  plural?: boolean;
  className?: string;
}) {
  const color = onFill
    ? ""
    : onDark
      ? large
        ? "text-raspberry-bright"
        : "text-berry-on-dark"
      : "text-raspberry";
  return (
    <>
      {lowercase ? "sh" : "Sh"}
      <span className={`font-bold ${color} ${className}`.trim()}>IF</span>
      {plural ? "ts" : "t"}
    </>
  );
}
