import { Skeleton } from "@/shared/ui";

export default function WorkspaceLoading() {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className="mx-auto w-full max-w-[1440px]"
    >
      <div className="flex items-end justify-between gap-6">
        <div className="w-full max-w-xl">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-3 h-9 w-72 max-w-full" />
          <Skeleton className="mt-3 h-5 w-full" />
        </div>
        <Skeleton className="hidden h-10 w-32 sm:block" />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="mt-9 h-6 w-40" />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
