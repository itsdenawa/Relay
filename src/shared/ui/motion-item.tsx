"use client";

import * as m from "motion/react-m";

import { cn } from "@/shared/lib";

type MotionItemProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}>;

function MotionItem({ children, className, delay = 0 }: MotionItemProps) {
  return (
    <m.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("min-w-0", className)}
    >
      {children}
    </m.div>
  );
}

export { MotionItem };
