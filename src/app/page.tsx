import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/entities/user";
import { getPrimaryWorkspace } from "@/entities/workspace";
import { LandingPage } from "@/views/landing";

export const metadata: Metadata = {
  title: "Project management for focused teams",
  description:
    "Relay keeps projects, tasks, comments, and files aligned for focused product and creative teams.",
};

export default async function Home() {
  const cookieStore = await cookies();
  const hasSupabaseSession = cookieStore
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
    );

  if (!hasSupabaseSession) {
    return <LandingPage />;
  }

  const user = await getCurrentUser();

  if (!user) {
    return <LandingPage />;
  }

  const workspace = await getPrimaryWorkspace(user.id);

  if (!workspace) {
    redirect("/onboarding");
  }

  redirect(`/w/${workspace.slug}`);
}
