"use client";

import { useActionState } from "react";

import { Button, Input, Label, NativeSelect } from "@/shared/ui";

import { inviteMemberAction } from "../api/actions";
import { initialInvitationActionState } from "../model/action-state";

type InviteMemberFormProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export function InviteMemberForm({
  workspaceId,
  workspaceSlug,
}: InviteMemberFormProps) {
  const [state, action, pending] = useActionState(
    inviteMemberAction,
    initialInvitationActionState,
  );

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
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <NativeSelect
            id="invite-role"
            name="role"
            defaultValue={state.values?.role || "member"}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </NativeSelect>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invite"}
        </Button>
      </div>
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
