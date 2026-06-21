begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select has_function(
  'public',
  'move_task',
  array['uuid', 'uuid', 'uuid', 'uuid'],
  'task movement accepts exact ordering neighbors'
);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ),
  'tasks are published through Supabase Realtime'
);

select is(
  (
    select relreplident::text
    from pg_class
    where oid = 'public.tasks'::regclass
  ),
  'f',
  'tasks use full replica identity for authoritative updates'
);

insert into auth.users (id, email)
values
  ('14000000-0000-4000-8000-000000000001', 'member@ordering.test'),
  ('14000000-0000-4000-8000-000000000002', 'outsider@ordering.test');

insert into public.workspaces (id, name, slug, created_by)
values (
  '24000000-0000-4000-8000-000000000001',
  'Ordering workspace',
  'ordering-workspace',
  '14000000-0000-4000-8000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role)
values (
  '24000000-0000-4000-8000-000000000001',
  '14000000-0000-4000-8000-000000000001',
  'member'
);

insert into public.projects (id, workspace_id, name, key, created_by)
values (
  '34000000-0000-4000-8000-000000000001',
  '24000000-0000-4000-8000-000000000001',
  'Ordering project',
  'ORDER',
  '14000000-0000-4000-8000-000000000001'
);

insert into public.board_columns (id, workspace_id, project_id, name, position)
values
  (
    '44000000-0000-4000-8000-000000000001',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    'Backlog',
    1000
  ),
  (
    '44000000-0000-4000-8000-000000000002',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    'In progress',
    2000
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
    '54000000-0000-4000-8000-000000000001',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    '44000000-0000-4000-8000-000000000001',
    'First',
    1024,
    '14000000-0000-4000-8000-000000000001'
  ),
  (
    '54000000-0000-4000-8000-000000000002',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    '44000000-0000-4000-8000-000000000001',
    'Second',
    1025,
    '14000000-0000-4000-8000-000000000001'
  ),
  (
    '54000000-0000-4000-8000-000000000003',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    '44000000-0000-4000-8000-000000000001',
    'Third',
    2048,
    '14000000-0000-4000-8000-000000000001'
  ),
  (
    '54000000-0000-4000-8000-000000000004',
    '24000000-0000-4000-8000-000000000001',
    '34000000-0000-4000-8000-000000000001',
    '44000000-0000-4000-8000-000000000002',
    'Target',
    1024,
    '14000000-0000-4000-8000-000000000001'
  );

set local role authenticated;
set local request.jwt.claim.sub = '14000000-0000-4000-8000-000000000001';

select lives_ok(
  $$ select public.move_task(
       '54000000-0000-4000-8000-000000000003',
       '44000000-0000-4000-8000-000000000001',
       '54000000-0000-4000-8000-000000000001',
       '54000000-0000-4000-8000-000000000002'
     ) $$,
  'Member can reorder between adjacent tasks when the position gap is exhausted'
);

select is(
  (
    select position
    from public.tasks
    where id = '54000000-0000-4000-8000-000000000003'
  ),
  1536::bigint,
  'exhausted gaps are normalized before placing the task'
);

select is(
  (
    select array_agg(title order by position)
    from public.tasks
    where column_id = '44000000-0000-4000-8000-000000000001'
  ),
  array['First', 'Third', 'Second'],
  'normalized positions preserve the requested intra-column order'
);

select lives_ok(
  $$ select public.move_task(
       '54000000-0000-4000-8000-000000000003',
       '44000000-0000-4000-8000-000000000002',
       null,
       '54000000-0000-4000-8000-000000000004'
     ) $$,
  'Member can place a task at the start of another column'
);

select results_eq(
  $$ select column_id, position
     from public.tasks
     where id = '54000000-0000-4000-8000-000000000003' $$,
  $$ values (
       '44000000-0000-4000-8000-000000000002'::uuid,
       512::bigint
     ) $$,
  'cross-column movement uses the requested first position'
);

select throws_ok(
  $$ select public.move_task(
       '54000000-0000-4000-8000-000000000001',
       '44000000-0000-4000-8000-000000000001',
       '54000000-0000-4000-8000-000000000001',
       null
     ) $$,
  '22023',
  'A task cannot be its own ordering neighbor',
  'self-referential ordering is rejected'
);

set local request.jwt.claim.sub = '14000000-0000-4000-8000-000000000002';

select throws_ok(
  $$ select public.move_task(
       '54000000-0000-4000-8000-000000000001',
       '44000000-0000-4000-8000-000000000001',
       null,
       null
     ) $$,
  '42501',
  'Workspace membership required',
  'outsiders cannot reorder tasks'
);

select * from finish();

rollback;
