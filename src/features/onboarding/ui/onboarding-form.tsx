"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button, Input, Label } from "@/shared/ui";

import {
  completeOnboardingAction,
  type OnboardingActionState,
} from "../api/actions";

function OnboardingSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-10 w-full" disabled={pending}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {pending ? "Creating workspace…" : "Create workspace"}
    </Button>
  );
}

type OnboardingFormProps = {
  defaultDisplayName: string;
};

const initialState: OnboardingActionState = { status: "idle" };
const workspaceNameExamples = [
  "Northstar Studio",
  "Acme Product",
  "Launch Team",
];

export function OnboardingForm({ defaultDisplayName }: OnboardingFormProps) {
  const [state, action] = useActionState(
    completeOnboardingAction,
    initialState,
  );
  const displayNameError = state.fieldErrors?.displayName?.[0];
  const workspaceNameError = state.fieldErrors?.workspaceName?.[0];

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="displayName">Your name</Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          defaultValue={state.values?.displayName ?? defaultDisplayName}
          aria-describedby={
            displayNameError ? "displayName-error" : "displayName-hint"
          }
          aria-invalid={Boolean(displayNameError)}
          className="h-10"
          required
        />
        {displayNameError ? (
          <p id="displayName-error" className="text-xs text-destructive">
            {displayNameError}
          </p>
        ) : (
          <p id="displayName-hint" className="text-xs text-muted-foreground">
            This is how teammates will see you.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input
          id="workspaceName"
          name="workspaceName"
          placeholder="Northstar Studio"
          list="workspace-name-examples"
          defaultValue={state.values?.workspaceName}
          aria-describedby={
            workspaceNameError
              ? "workspaceName-error workspaceName-examples-hint"
              : "workspaceName-hint workspaceName-examples-hint"
          }
          aria-invalid={Boolean(workspaceNameError)}
          className="h-10"
          required
        />
        <datalist id="workspace-name-examples">
          {workspaceNameExamples.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        {workspaceNameError ? (
          <p id="workspaceName-error" className="text-xs text-destructive">
            {workspaceNameError}
          </p>
        ) : (
          <p id="workspaceName-hint" className="text-xs text-muted-foreground">
            Use a team, company, or initiative name. You can rename it later.
          </p>
        )}
        <p id="workspaceName-examples-hint" className="sr-only">
          Example workspace names include Northstar Studio, Acme Product, and
          Launch Team.
        </p>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <section
        aria-labelledby="onboarding-next-steps"
        className="rounded-2xl border bg-muted/35 p-4"
      >
        <h2 id="onboarding-next-steps" className="text-sm font-semibold">
          What happens next
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {[
            "Relay opens your dashboard with a short launch checklist.",
            "Your first project starts with a ready-to-use board.",
            "You can invite teammates when the workspace has shape.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <OnboardingSubmitButton />
    </form>
  );
}
