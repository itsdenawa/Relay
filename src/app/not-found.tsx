import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button, RelayLogo } from "@/shared/ui";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center px-6 py-16"
    >
      <div className="max-w-md text-center">
        <RelayLogo className="mx-auto justify-center" />
        <div className="mx-auto mt-10 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX className="size-5" />
        </div>
        <p className="mt-6 text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          This page is not here
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The link may be outdated, or the workspace is no longer available to
          your account.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
