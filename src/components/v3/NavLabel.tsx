import { Fragment } from "react";
import { ShIFt } from "./ShIFt";

/**
 * Renders a menu label, styling the IF wherever "ShIFt" appears (PPS-DEC-0022).
 *
 * `plain`: the IF stays bold but takes the label's own colour. Used for the header's top-level labels, which
 * sit on the see-through pill (PPS Admin, 2026-11-07); the dropdowns and the phone menu keep the raspberry IF.
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
