"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

import { WebVitalsReporter } from "@/shared/lib/web-vitals-reporter";
import { Toaster } from "@/shared/ui/toaster";

const loadMotionFeatures = () =>
  import("@/shared/lib/motion-features").then((module) => module.default);

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig
          reducedMotion="user"
          transition={{
            duration: 0.18,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <WebVitalsReporter />
          </ThemeProvider>
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  );
}
