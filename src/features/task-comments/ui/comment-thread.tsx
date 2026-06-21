"use client";

import { useState, type FormEvent } from "react";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";

import type { TaskComment } from "@/entities/comment/client";
import { cn } from "@/shared/lib";
import { Avatar, AvatarFallback, Button, Textarea } from "@/shared/ui";

import { useTaskComments } from "../api/use-task-comments";
import { commentBodySchema } from "../model/schemas";

type CommentThreadProps = {
  context: {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  currentUserId: string;
  initialComments: TaskComment[];
  readOnly?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCommentTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function CommentCard({
  comment,
  canManage,
  isEditing,
  isDeleting,
  onEdit,
  onDelete,
}: {
  comment: TaskComment;
  canManage: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [error, setError] = useState<string>();

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = commentBodySchema.safeParse(body);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    try {
      await onEdit(comment.id, result.data);
      setError(undefined);
      setEditing(false);
    } catch {
      // The mutation keeps the editor open and displays an error toast.
    }
  }

  return (
    <article
      aria-label={`Comment by ${comment.author.displayName}`}
      className="rounded-xl border bg-card p-3"
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="mt-0.5 size-7">
          <AvatarFallback className="text-[9px]">
            {initials(comment.author.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium">
              {comment.author.displayName}
            </span>
            <time
              dateTime={comment.created_at}
              className="text-[11px] text-muted-foreground"
            >
              {formatCommentTime(comment.created_at)}
              {comment.edited_at ? " · edited" : ""}
            </time>
          </div>

          {editing ? (
            <form onSubmit={saveEdit} className="mt-2 space-y-2">
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                aria-label={`Edit comment by ${comment.author.displayName}`}
                maxLength={10000}
                rows={3}
                disabled={isEditing}
              />
              {error ? (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isEditing}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isEditing}
                  onClick={() => {
                    setBody(comment.body);
                    setError(undefined);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap">
              {comment.body}
            </p>
          )}
        </div>

        {canManage && !editing ? (
          <div className="flex shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit comment by ${comment.author.displayName}`}
              onClick={() => setEditing(true)}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete comment by ${comment.author.displayName}`}
              disabled={isDeleting}
              onClick={() => void onDelete(comment.id).catch(() => undefined)}
            >
              <Trash2 />
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function CommentThread({
  context,
  currentUserId,
  initialComments,
  readOnly = false,
}: CommentThreadProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const {
    comments,
    error: queryError,
    realtimeStatus,
    addComment,
    editComment,
    deleteComment,
    isAdding,
    editingCommentId,
    deletingCommentId,
  } = useTaskComments({
    ...context,
    currentUserId,
    initialComments,
  });

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = commentBodySchema.safeParse(body);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    try {
      await addComment(result.data);
      setBody("");
      setError(undefined);
    } catch {
      // The mutation displays the actionable error toast.
    }
  }

  return (
    <section aria-labelledby="task-comments-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="task-comments-heading"
          className="flex items-center gap-2 font-semibold"
        >
          <MessageSquare className="size-4" />
          Comments
          <span className="text-xs font-normal text-muted-foreground">
            {comments.length}
          </span>
        </h3>
        <span
          aria-label="Comments realtime status"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              realtimeStatus === "live"
                ? "bg-emerald-500"
                : realtimeStatus === "connecting"
                  ? "animate-pulse bg-amber-500"
                  : "bg-muted-foreground/50",
            )}
          />
          {realtimeStatus === "live" ? "Live" : "Reconnecting"}
        </span>
      </div>

      {queryError ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm">
          Comments could not be loaded.
        </p>
      ) : null}

      <div className="space-y-2" aria-live="polite">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            canManage={!readOnly && comment.author_id === currentUserId}
            isEditing={editingCommentId === comment.id}
            isDeleting={deletingCommentId === comment.id}
            onEdit={async (id, nextBody) => {
              await editComment({ id, body: nextBody });
            }}
            onDelete={deleteComment}
          />
        ))}
        {!comments.length && !queryError ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-center">
            <p className="text-sm font-medium">No comments yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the conversation with your team.
            </p>
          </div>
        ) : null}
      </div>

      {!readOnly ? (
        <form onSubmit={submitComment} className="space-y-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a comment…"
            aria-label="Write a comment"
            maxLength={10000}
            rows={3}
            disabled={isAdding}
          />
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isAdding}>
              {isAdding ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">
          Restore this task or project to continue the discussion.
        </p>
      )}
    </section>
  );
}
