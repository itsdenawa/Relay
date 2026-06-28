"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getPrimaryNavigation } from "@/shared/config/navigation";

export function RoutePrefetcher({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const routes = [
      ...getPrimaryNavigation(workspaceSlug)
        .filter((item) => !item.disabled)
        .map((item) => item.href),
      `/w/${workspaceSlug}/settings`,
      `/w/${workspaceSlug}/settings/profile`,
    ];

    for (const href of routes) {
      router.prefetch(href);
    }
  }, [router, workspaceSlug]);

  return null;
}
