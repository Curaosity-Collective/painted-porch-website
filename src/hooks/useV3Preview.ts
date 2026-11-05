import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { isLovableEditorPreview } from "@/lib/lovablePreview";

const KEY = "pps-v3-preview";

function readStored(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Preview of the restyled live pages before go-live. `?v3=1` turns it on for
 * the rest of the browser session and `?v3=0` turns it off. Only admins,
 * editors and the Lovable editor preview can use it; for everyone else the
 * parameter does nothing.
 */
export function useV3Preview(search: string): boolean {
  const { role } = useUserRole();
  const canPreview = role === "admin" || role === "editor" || isLovableEditorPreview();
  const param = new URLSearchParams(search).get("v3");
  const [stored, setStored] = useState(readStored);

  useEffect(() => {
    if (param !== "1" && param !== "0") return;
    try {
      window.sessionStorage.setItem(KEY, param);
    } catch {
      // Storage can be unavailable (private mode); the URL parameter still works.
    }
    setStored(param === "1");
  }, [param]);

  if (!canPreview) return false;
  if (param === "1") return true;
  if (param === "0") return false;
  return stored;
}
