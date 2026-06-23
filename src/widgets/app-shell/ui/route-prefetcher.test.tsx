import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoutePrefetcher } from "./route-prefetcher";

const prefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch }),
}));

describe("RoutePrefetcher", () => {
  beforeEach(() => {
    prefetch.mockClear();
  });

  it("warms the core workspace routes after the shell mounts", async () => {
    render(<RoutePrefetcher workspaceSlug="northstar" />);

    await waitFor(() => {
      expect(prefetch).toHaveBeenCalledWith("/w/northstar");
      expect(prefetch).toHaveBeenCalledWith("/w/northstar/projects");
      expect(prefetch).toHaveBeenCalledWith("/w/northstar/members");
      expect(prefetch).toHaveBeenCalledWith("/w/northstar/settings");
      expect(prefetch).toHaveBeenCalledWith("/w/northstar/settings/profile");
    });
    expect(prefetch).not.toHaveBeenCalledWith("/w/northstar/reports");
  });
});
