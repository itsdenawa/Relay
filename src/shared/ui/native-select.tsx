import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib";

function NativeSelect({
  className,
  iconClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & { iconClassName?: string }) {
  return (
    <span className="relative block min-w-0">
      <select
        data-slot="native-select"
        className={cn(
          "h-9 w-full min-w-0 appearance-none truncate rounded-lg border border-input bg-background py-1 pr-10 pl-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 z-10 size-4 shrink-0 -translate-y-1/2 text-muted-foreground",
          iconClassName,
        )}
      />
    </span>
  );
}

export { NativeSelect };
