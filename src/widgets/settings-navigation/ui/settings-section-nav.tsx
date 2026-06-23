"use client";

import { usePathname } from "next/navigation";
import { UserRound, UsersRound, Building2 } from "lucide-react";

import { cn } from "@/shared/lib";
import { PrefetchLink } from "@/shared/ui";

const settingsSections = [
  {
    label: "Personal settings",
    href: (workspaceSlug: string) => `/w/${workspaceSlug}/settings/profile`,
    icon: UserRound,
  },
  {
    label: "Workspace settings",
    href: (workspaceSlug: string) => `/w/${workspaceSlug}/settings`,
    icon: Building2,
  },
  {
    label: "Members & roles",
    href: (workspaceSlug: string) => `/w/${workspaceSlug}/members`,
    icon: UsersRound,
  },
] as const;

export function SettingsSectionNav({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="mt-5 flex flex-wrap gap-2">
      {settingsSections.map(({ label, href: buildHref, icon: Icon }) => {
        const href = buildHref(workspaceSlug);
        const active = pathname === href;

        return (
          <PrefetchLink
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                : "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </PrefetchLink>
        );
      })}
    </nav>
  );
}
