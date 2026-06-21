alter table public.comments
add column deleted_at timestamptz;

drop policy "comments_insert_author" on public.comments;
drop policy "comments_update_author" on public.comments;
drop policy "comments_delete_author" on public.comments;

create policy "comments_insert_author"
on public.comments for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and deleted_at is null
  and (select private.is_workspace_member(workspace_id))
  and exists (
    select 1
    from public.tasks as task
    inner join public.projects as project
      on project.id = task.project_id
     and project.workspace_id = task.workspace_id
    where task.id = comments.task_id
      and task.workspace_id = comments.workspace_id
      and task.project_id = comments.project_id
      and task.archived_at is null
      and project.archived_at is null
  )
);

create policy "comments_update_author"
on public.comments for update
to authenticated
using (
  author_id = (select auth.uid())
  and deleted_at is null
  and exists (
    select 1
    from public.tasks as task
    inner join public.projects as project
      on project.id = task.project_id
     and project.workspace_id = task.workspace_id
    where task.id = comments.task_id
      and task.workspace_id = comments.workspace_id
      and task.project_id = comments.project_id
      and task.archived_at is null
      and project.archived_at is null
  )
)
with check (
  author_id = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
  and exists (
    select 1
    from public.tasks as task
    inner join public.projects as project
      on project.id = task.project_id
     and project.workspace_id = task.workspace_id
    where task.id = comments.task_id
      and task.workspace_id = comments.workspace_id
      and task.project_id = comments.project_id
      and task.archived_at is null
      and project.archived_at is null
  )
);

create policy "comments_delete_author"
on public.comments for delete
to authenticated
using (
  author_id = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
  and exists (
    select 1
    from public.tasks as task
    inner join public.projects as project
      on project.id = task.project_id
     and project.workspace_id = task.workspace_id
    where task.id = comments.task_id
      and task.workspace_id = comments.workspace_id
      and task.project_id = comments.project_id
      and task.archived_at is null
      and project.archived_at is null
  )
);

revoke update on table public.comments from authenticated;
grant update (body, edited_at, deleted_at)
  on table public.comments to authenticated;

alter table public.comments replica identity full;
alter publication supabase_realtime add table public.comments;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'task-attachments',
  'task-attachments',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create function private.can_access_task_attachment(
  object_name text,
  require_active_task boolean default false
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  path_parts text[];
  parsed_workspace_id uuid;
  parsed_project_id uuid;
  parsed_task_id uuid;
begin
  path_parts := string_to_array(object_name, '/');

  if cardinality(path_parts) <> 4
    or path_parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or path_parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or path_parts[3] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or path_parts[4] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    return false;
  end if;

  parsed_workspace_id := path_parts[1]::uuid;
  parsed_project_id := path_parts[2]::uuid;
  parsed_task_id := path_parts[3]::uuid;

  return exists (
    select 1
    from public.tasks as task
    inner join public.projects as project
      on project.id = task.project_id
     and project.workspace_id = task.workspace_id
    inner join public.workspace_members as membership
      on membership.workspace_id = task.workspace_id
    where task.id = parsed_task_id
      and task.workspace_id = parsed_workspace_id
      and task.project_id = parsed_project_id
      and membership.user_id = auth.uid()
      and (
        not require_active_task
        or (task.archived_at is null and project.archived_at is null)
      )
  );
end;
$$;

create function private.can_delete_task_attachment(
  object_name text,
  object_owner_id text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  workspace_id uuid;
begin
  if not private.can_access_task_attachment(object_name, false) then
    return false;
  end if;

  workspace_id := split_part(object_name, '/', 1)::uuid;

  return object_owner_id = auth.uid()::text
    or private.has_workspace_role(
      workspace_id,
      array['owner', 'admin']::public.workspace_role[]
    );
end;
$$;

create policy "task_attachments_select_members"
on storage.objects for select
to authenticated
using (
  bucket_id = 'task-attachments'
  and (select private.can_access_task_attachment(name, false))
);

create policy "task_attachments_insert_members"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and owner_id = (select auth.uid())::text
  and (select private.can_access_task_attachment(name, true))
);

create policy "task_attachments_delete_uploader_or_manager"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and (select private.can_delete_task_attachment(name, owner_id))
);

drop policy "attachments_insert_uploader" on public.attachments;
revoke insert on table public.attachments from authenticated;

create function public.create_attachment(
  target_task_id uuid,
  attachment_storage_path text,
  attachment_file_name text,
  attachment_content_type text,
  attachment_size_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  task_record public.tasks%rowtype;
  attachment_id uuid;
  allowed_content_types constant text[] := array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]::text[];
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select task.*
  into task_record
  from public.tasks as task
  inner join public.projects as project
    on project.id = task.project_id
   and project.workspace_id = task.workspace_id
  where task.id = target_task_id
    and task.archived_at is null
    and project.archived_at is null;

  if task_record.id is null then
    raise exception 'Active task not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.workspace_members as membership
    where membership.workspace_id = task_record.workspace_id
      and membership.user_id = actor_id
  ) then
    raise exception 'Workspace membership required' using errcode = '42501';
  end if;

  if char_length(trim(attachment_file_name)) not between 1 and 255 then
    raise exception 'Attachment file name is invalid' using errcode = '22023';
  end if;

  if attachment_size_bytes not between 1 and 10485760 then
    raise exception 'Attachment size must be between 1 byte and 10 MB'
      using errcode = '22023';
  end if;

  if not attachment_content_type = any (allowed_content_types) then
    raise exception 'Attachment content type is not allowed'
      using errcode = '22023';
  end if;

  if not private.can_access_task_attachment(attachment_storage_path, true)
    or split_part(attachment_storage_path, '/', 1) <> task_record.workspace_id::text
    or split_part(attachment_storage_path, '/', 2) <> task_record.project_id::text
    or split_part(attachment_storage_path, '/', 3) <> task_record.id::text
  then
    raise exception 'Attachment path must match the active task'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'task-attachments'
      and object.name = attachment_storage_path
      and object.owner_id = actor_id::text
  ) then
    raise exception 'Uploaded attachment object not found'
      using errcode = 'P0002';
  end if;

  insert into public.attachments (
    workspace_id,
    project_id,
    task_id,
    uploader_id,
    storage_path,
    file_name,
    content_type,
    size_bytes
  )
  values (
    task_record.workspace_id,
    task_record.project_id,
    task_record.id,
    actor_id,
    attachment_storage_path,
    trim(attachment_file_name),
    attachment_content_type,
    attachment_size_bytes
  )
  returning id into attachment_id;

  return attachment_id;
end;
$$;

revoke all on function private.can_access_task_attachment(text, boolean)
  from public;
revoke all on function private.can_delete_task_attachment(text, text)
  from public;
revoke all on function public.create_attachment(uuid, text, text, text, bigint)
  from public;

grant execute on function private.can_access_task_attachment(text, boolean)
  to authenticated, service_role;
grant execute on function private.can_delete_task_attachment(text, text)
  to authenticated, service_role;
grant execute on function public.create_attachment(uuid, text, text, text, bigint)
  to authenticated, service_role;
