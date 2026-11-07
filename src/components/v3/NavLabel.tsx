import { Fragment } from "react";
import { ShIFt } from "./ShIFt";

/**
 * Renders a menu label, styling the IF wherever "ShIFt" appears (PPS-DEC-0022).
 *
 * `plain`: the IF stays bold but takes the label's own colour. Used throughout the header,
 * including dropdowns and the phone menu (PPS Admin, 2026-11-07). Footer labels keep their own styling.
 */
export function NavLabel({ label, onDark = false, plain = false }: { label: string; onDark?: boolean; plain?: boolean }) {
  const parts = label.split("ShIFt");
  if (parts.length === 1) return <>{label}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <ShIFt onDark={onDark} onFill={plain} />}
        </Fragment>
      ))}
    </>
  );
}
