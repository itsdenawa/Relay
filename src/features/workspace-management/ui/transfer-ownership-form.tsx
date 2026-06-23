"use client";

import { useActionState } from "react";

import type { WorkspaceMember } from "@/entities/workspace";
import { Button, Label, NativeSelect } from "@/shared/ui";

import { transferOwnershipAction } from "../api/actions";
import { initialWorkspaceActionState } from "../model/action-state";

type TransferOwnershipFormProps = {
  workspaceId: string;
  workspaceSlug: string;
  members: WorkspaceMember[];
  currentUserId: string;
};

export function TransferOwnershipForm({
  workspaceId,
  workspaceSlug,
  members,
  currentUserId,
}: TransferOwnershipFormProps) {
  const [state, action, pending] = useActionState(
    transferOwnershipAction,
    initialWorkspaceActionState,
  );
  const candidates = members.filter((member) => member.id !== currentUserId);

  if (!candidates.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Invite another member before transferring ownership.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <div className="max-w-md space-y-2">
        <Label htmlFor="new-owner">New Owner</Label>
        <NativeSelect id="new-owner" name="userId" defaultValue="" required>
          <option value="" disabled>
            Select a member
          </option>
          {candidates.map((member) => (
            <option key={member.id} value={member.id}>
              {member.displayName} ({member.email})
            </option>
          ))}
        </NativeSelect>
      </div>
      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Transferring…" : "Transfer ownership"}
      </Button>
    </form>
  );
}
