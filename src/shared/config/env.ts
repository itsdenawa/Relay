import { z } from "zod";

const publicEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  })
  .superRefine((environment, context) => {
    const hasUrl = environment.NEXT_PUBLIC_SUPABASE_URL !== undefined;
    const hasKey =
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== undefined;

    if (hasUrl === hasKey) {
      return;
    }

    context.addIssue({
      code: "custom",
      message: "Supabase URL and publishable key must be configured together.",
      path: [
        hasUrl
          ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
          : "NEXT_PUBLIC_SUPABASE_URL",
      ],
    });
  });

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(
  environment: Record<string, string | undefined>,
): PublicEnvironment {
  return publicEnvironmentSchema.parse(environment);
}

export const publicEnvironment = parsePublicEnvironment({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
});
