import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { lazyPage } from "./lazy-page";

afterEach(cleanup);

describe("Route chunk loading", () => {
  it("does not request a page until it is rendered and preserves the surrounding layout", async () => {
    let resolvePage: ((module: { default: () => JSX.Element }) => void) | undefined;
    const loader = vi.fn(() => new Promise<{ default: () => JSX.Element }>((resolve) => { resolvePage = resolve; }));
    const Page = lazyPage(loader);
    expect(loader).not.toHaveBeenCalled();
    render(<><nav>Navigation</nav><Page /></>);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByRole("navigation")).toBeTruthy();
    await act(async () => { resolvePage?.({ default: () => <h1>Loaded page</h1> }); });
    expect(screen.getByRole("heading").textContent).toBe("Loaded page");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
});