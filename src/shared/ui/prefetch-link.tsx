"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startTransition,
  type ComponentProps,
  type MouseEvent,
  type FocusEvent,
} from "react";

type PrefetchLinkProps = ComponentProps<typeof Link>;

function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

function canPrefetch(href: PrefetchLinkProps["href"]): href is string {
  return typeof href === "string" && href.startsWith("/");
}

export function PrefetchLink({
  href,
  onClick,
  onMouseEnter,
  onFocus,
  prefetch = true,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();

  function prefetchHref() {
    if (prefetch && canPrefetch(href)) {
      router.prefetch(href);
    }
  }

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        prefetchHref();
        onMouseEnter?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        prefetchHref();
        onFocus?.(event);
      }}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (isPlainPrimaryClick(event)) {
          startTransition(() => {
            prefetchHref();
          });
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
