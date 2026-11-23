import { lazy, Suspense, type ComponentType } from "react";
import { LoaderCircle } from "lucide-react";

/** A per-page loading boundary keeps the surrounding layout mounted. */
export function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load);
  return function LazyPage() {
    return (
      <Suspense fallback={
        <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Loading">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
        </div>
      }>
        <Page />
      </Suspense>
    );
  };
}