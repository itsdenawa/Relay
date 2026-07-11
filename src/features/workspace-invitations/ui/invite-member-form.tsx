"use client";

import { useActionState, useState } from "react";

import { Button, Input, Label, NativeSelect } from "@/shared/ui";

import { inviteMemberAction } from "../api/actions";
import { initialInvitationActionState } from "../model/action-state";

type InviteMemberFormProps = {
  workspaceId: string;
  workspaceSlug: string;
};

const roleDescriptions = {
  member: "Can create and update project work, comments, and attachments.",
  admin: "Can also manage projects, workspace members, and invitations.",
} as const;

export function InviteMemberForm({
  workspaceId,
  workspaceSlug,
}: InviteMemberFormProps) {
  const [state, action, pending] = useActionState(
    inviteMemberAction,
    initialInvitationActionState,
  );
  const [role, setRole] = useState<keyof typeof roleDescriptions>(
    state.values?.role === "admin" ? "admin" : "member",
  );
  const emailError = state.fieldErrors?.email?.[0];

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="teammate@company.com"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "invite-email-error" : undefined}
            autoComplete="email"
          />
          {emailError ? (
            <p id="invite-email-error" className="text-xs text-destructive">
              {emailError}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <NativeSelect
            id="invite-role"
            name="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value === "admin" ? "admin" : "member")
            }
            aria-describedby="invite-role-description"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </NativeSelect>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invite"}
        </Button>
      </div>
      <p
        id="invite-role-description"
        className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground"
      >
        <span className="font-medium text-foreground">
          {role === "admin" ? "Admin access:" : "Member access:"}
        </span>{" "}
        {roleDescriptions[role]}
      </p>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-emerald-600 dark:text-emerald-400"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
