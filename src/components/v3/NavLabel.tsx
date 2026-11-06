import { Fragment } from "react";
import { ShIFt } from "./ShIFt";

/** Renders a menu label, styling the IF wherever "ShIFt" appears (PPS-DEC-0022). */
export function NavLabel({ label, onDark = false }: { label: string; onDark?: boolean }) {
  const parts = label.split("ShIFt");
  if (parts.length === 1) return <>{label}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <ShIFt onDark={onDark} />}
        </Fragment>
      ))}
    </>
  );
}
