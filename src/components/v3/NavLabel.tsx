import { Fragment } from "react";
import { ShIFt } from "./ShIFt";

/**
 * Renders a menu label, styling the IF wherever "ShIFt" appears (PPS-DEC-0022).
 *
 * `plain`: the header's labels sit on light backgrounds, so the IF carries the
 * brand blend for light backgrounds (PPS Admin, 2026-11-24: "Lets also update
 * the top menu IFs"). Footer labels pass `onDark` instead and carry the blend
 * for dark backgrounds. Problem wording still stays solid raspberry through
 * `ShIFt` itself.
 */
export function NavLabel({ label, onDark = false, plain = false }: { label: string; onDark?: boolean; plain?: boolean }) {
  const parts = label.split("ShIFt");
  if (parts.length === 1) return <>{label}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <ShIFt onDark={onDark && !plain} />}
        </Fragment>
      ))}
    </>
  );
}
