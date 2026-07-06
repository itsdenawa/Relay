import { AccountMenu } from "@/features/account-menu";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { RelayLogo } from "@/shared/ui";

import { CommandPalette } from "./command-palette";
import { MobileNavigationTrigger } from "./mobile-navigation";

type AppHeaderProps = {
  user: { displayName: string; email: string; avatarUrl: string | null };
  workspace: { name: string; slug: string; role: string };
  workspaces: Array<{ name: string; slug: string; role: string }>;
};

export function AppHeader({ user, workspace, workspaces }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
      <MobileNavigationTrigger
        user={user}
        workspace={workspace}
        workspaces={workspaces}
      />
      <RelayLogo className="mr-auto md:hidden" />

      <CommandPalette workspace={workspace} workspaces={workspaces} />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeSwitcher />
        <AccountMenu {...user} workspaceSlug={workspace.slug} />
      </div>
    </header>
  );
}
