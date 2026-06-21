begin;

create extension if not exists pgtap with schema extensions;

select plan(29);

select has_column(
  'public',
  'comments',
  'deleted_at',
  'comments support realtime-friendly soft deletion'
);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'comments'
  ),
  'comments are published through Supabase Realtime'
);

select is(
  (
    select relreplident::text
    from pg_class
    where oid = 'public.comments'::regclass
  ),
  'f',
  'comments use full replica identity'
);

select is(
  (select public from storage.buckets where id = 'task-attachments'),
  false,
  'task attachment bucket is private'
);

select is(
  (select file_size_limit from storage.buckets where id = 'task-attachments'),
  10485760::bigint,
  'task attachment bucket enforces the 10 MB limit'
);

select ok(
  (
    select allowed_mime_types @> array[
      'image/png',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]::text[]
    from storage.buckets
    where id = 'task-attachments'
  ),
  'task attachment bucket has the required MIME allowlist'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'task_attachments_select_members'
  ),
  'private attachment objects have a member select policy'
);

insert into auth.users (id, email)
values
  ('15000000-0000-4000-8000-000000000001', 'owner@collaboration.test'),
  ('15000000-0000-4000-8000-000000000002', 'member@collaboration.test'),
  ('15000000-0000-4000-8000-000000000003', 'outsider@collaboration.test');

insert into public.workspaces (id, name, slug, created_by)
values (
  '25000000-0000-4000-8000-000000000001',
  'Collaboration workspace',
  'collaboration-workspace',
  '15000000-0000-4000-8000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role)
values
  (
    '25000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '25000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000002',
    'member'
  );

insert into public.projects (id, workspace_id, name, key, created_by)
values (
  '35000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000001',
  'Collaboration project',
  'COLLAB',
  '15000000-0000-4000-8000-000000000001'
);

insert into public.board_columns (id, workspace_id, project_id, name, position)
values (
  '45000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000001',
  '35000000-0000-4000-8000-000000000001',
  'Backlog',
  1024
);

insert into public.tasks (
  id,
  workspace_id,
  project_id,
  column_id,
  title,
  position,
  created_by
)
values
  (
    '55000000-0000-4000-8000-000000000001',
    '25000000-0000-4000-8000-000000000001',
    '35000000-0000-4000-8000-000000000001',
    '45000000-0000-4000-8000-000000000001',
    'Collaborative task',
    1024,
    '15000000-0000-4000-8000-000000000001'
  ),
  (
    '55000000-0000-4000-8000-000000000002',
    '25000000-0000-4000-8000-000000000001',
    '35000000-0000-4000-8000-000000000001',
    '45000000-0000-4000-8000-000000000001',
    'Second task',
    2048,
    '15000000-0000-4000-8000-000000000001'
  );

insert into public.comments (
  id,
  workspace_id,
  project_id,
  task_id,
  author_id,
  body
)
values
  (
    '65000000-0000-4000-8000-000000000001',
    '25000000-0000-4000-8000-000000000001',
    '35000000-0000-4000-8000-000000000001',
    '55000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000001',
    'Owner comment'
  ),
  (
    '65000000-0000-4000-8000-000000000003',
    '25000000-0000-4000-8000-000000000001',
    '35000000-0000-4000-8000-000000000001',
    '55000000-0000-4000-8000-000000000002',
    '15000000-0000-4000-8000-000000000002',
    'Comment on task to archive'
  );

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  (
    'task-attachments',
    '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000001',
    '{"mimetype":"text/plain","size":12}'::jsonb
  ),
  (
    'task-attachments',
    '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000002',
    '15000000-0000-4000-8000-000000000002',
    '{"mimetype":"text/plain","size":12}'::jsonb
  ),
  (
    'task-attachments',
    '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000003',
    '15000000-0000-4000-8000-000000000002',
    '{"mimetype":"text/plain","size":12}'::jsonb
  ),
  (
    'task-attachments',
    '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000004',
    '15000000-0000-4000-8000-000000000002',
    '{"mimetype":"text/plain","size":12}'::jsonb
  );

set local role authenticated;
set local request.jwt.claim.sub = '15000000-0000-4000-8000-000000000002';
set local "storage.allow_delete_query" = 'true';

select lives_ok(
  $$ insert into public.comments (
       id,
       workspace_id,
       project_id,
       task_id,
       author_id,
       body
     ) values (
       '65000000-0000-4000-8000-000000000002',
       '25000000-0000-4000-8000-000000000001',
       '35000000-0000-4000-8000-000000000001',
       '55000000-0000-4000-8000-000000000001',
       '15000000-0000-4000-8000-000000000002',
       'Member comment'
     ) $$,
  'member can add a comment to an active task'
);

select lives_ok(
  $$ update public.comments
     set body = 'Member comment edited', edited_at = now()
     where id = '65000000-0000-4000-8000-000000000002' $$,
  'member can edit their own active comment'
);

select results_eq(
  $$ with changed as (
       update public.comments
       set body = 'Tampered'
       where id = '65000000-0000-4000-8000-000000000001'
       returning 1
     )
     select count(*) from changed $$,
  $$ values (0::bigint) $$,
  'member cannot edit another author comment'
);

select lives_ok(
  $$ update public.comments
     set deleted_at = now()
     where id = '65000000-0000-4000-8000-000000000002' $$,
  'member can soft-delete their own comment'
);

select throws_ok(
  $$ insert into public.comments (
       workspace_id,
       project_id,
       task_id,
       author_id,
       body
     ) values (
       '25000000-0000-4000-8000-000000000001',
       '35000000-0000-4000-8000-000000000001',
       '55000000-0000-4000-8000-000000000001',
       '15000000-0000-4000-8000-000000000001',
       'Impersonated comment'
     ) $$,
  '42501',
  null,
  'member cannot create a comment as another author'
);

select is(
  (select count(*) from storage.objects where bucket_id = 'task-attachments'),
  4::bigint,
  'member can read attachment objects in their workspace'
);

select lives_ok(
  $$ select public.create_attachment(
       '55000000-0000-4000-8000-000000000001',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000002',
       'notes.txt',
       'text/plain',
       12
     ) $$,
  'member can register metadata for their uploaded object'
);

select results_eq(
  $$ select file_name, content_type, size_bytes
     from public.attachments
     where uploader_id = '15000000-0000-4000-8000-000000000002' $$,
  $$ values ('notes.txt'::text, 'text/plain'::text, 12::bigint) $$,
  'attachment metadata is stored separately from the object'
);

select throws_ok(
  $$ select public.create_attachment(
       '55000000-0000-4000-8000-000000000001',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000003',
       'malware.exe',
       'application/octet-stream',
       12
     ) $$,
  '22023',
  'Attachment content type is not allowed',
  'disallowed attachment content types are rejected'
);

select throws_ok(
  $$ select public.create_attachment(
       '55000000-0000-4000-8000-000000000002',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000003',
       'notes.txt',
       'text/plain',
       12
     ) $$,
  '22023',
  'Attachment path must match the active task',
  'attachment path must match the requested task'
);

update public.tasks
set archived_at = now()
where id = '55000000-0000-4000-8000-000000000002';

select results_eq(
  $$ with changed as (
       update public.comments
       set body = 'Edited after archive'
       where id = '65000000-0000-4000-8000-000000000003'
       returning 1
     )
     select count(*) from changed $$,
  $$ values (0::bigint) $$,
  'archived tasks make existing comments read-only'
);

select throws_ok(
  $$ insert into public.comments (
       workspace_id,
       project_id,
       task_id,
       author_id,
       body
     ) values (
       '25000000-0000-4000-8000-000000000001',
       '35000000-0000-4000-8000-000000000001',
       '55000000-0000-4000-8000-000000000002',
       '15000000-0000-4000-8000-000000000002',
       'Archived task comment'
     ) $$,
  '42501',
  null,
  'archived tasks reject new comments'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values (
       'task-attachments',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000002/75000000-0000-4000-8000-000000000006',
       '15000000-0000-4000-8000-000000000002'
     ) $$,
  '42501',
  null,
  'archived tasks reject new attachment objects'
);

select results_eq(
  $$ with deleted as (
       delete from storage.objects
       where bucket_id = 'task-attachments'
         and name like '%/75000000-0000-4000-8000-000000000001'
       returning 1
     )
     select count(*) from deleted $$,
  $$ values (0::bigint) $$,
  'member cannot delete an object uploaded by the owner'
);

select results_eq(
  $$ with deleted as (
       delete from storage.objects
       where bucket_id = 'task-attachments'
         and name like '%/75000000-0000-4000-8000-000000000003'
       returning 1
     )
     select count(*) from deleted $$,
  $$ values (1::bigint) $$,
  'member can delete their own attachment object'
);

set local request.jwt.claim.sub = '15000000-0000-4000-8000-000000000003';

select is(
  (
    select count(*)
    from public.comments
    where workspace_id = '25000000-0000-4000-8000-000000000001'
  ),
  0::bigint,
  'outsider cannot read workspace comments'
);

select throws_ok(
  $$ insert into public.comments (
       workspace_id,
       project_id,
       task_id,
       author_id,
       body
     ) values (
       '25000000-0000-4000-8000-000000000001',
       '35000000-0000-4000-8000-000000000001',
       '55000000-0000-4000-8000-000000000001',
       '15000000-0000-4000-8000-000000000003',
       'Outsider comment'
     ) $$,
  '42501',
  null,
  'outsider cannot add a workspace comment'
);

select is(
  (select count(*) from storage.objects where bucket_id = 'task-attachments'),
  0::bigint,
  'outsider cannot read private attachment objects'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values (
       'task-attachments',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000005',
       '15000000-0000-4000-8000-000000000003'
     ) $$,
  '42501',
  null,
  'outsider cannot upload into another workspace path'
);

select throws_ok(
  $$ select public.create_attachment(
       '55000000-0000-4000-8000-000000000001',
       '25000000-0000-4000-8000-000000000001/35000000-0000-4000-8000-000000000001/55000000-0000-4000-8000-000000000001/75000000-0000-4000-8000-000000000004',
       'notes.txt',
       'text/plain',
       12
     ) $$,
  '42501',
  'Workspace membership required',
  'outsider cannot register attachment metadata'
);

set local request.jwt.claim.sub = '15000000-0000-4000-8000-000000000001';

select results_eq(
  $$ with deleted as (
       delete from storage.objects
       where bucket_id = 'task-attachments'
         and name like '%/75000000-0000-4000-8000-000000000004'
       returning 1
     )
     select count(*) from deleted $$,
  $$ values (1::bigint) $$,
  'workspace owner can delete a member attachment object'
);

select results_eq(
  $$ with deleted as (
       delete from public.attachments
       where uploader_id = '15000000-0000-4000-8000-000000000002'
       returning 1
     )
     select count(*) from deleted $$,
  $$ values (1::bigint) $$,
  'workspace owner can delete member attachment metadata'
);

select * from finish();

rollback;
