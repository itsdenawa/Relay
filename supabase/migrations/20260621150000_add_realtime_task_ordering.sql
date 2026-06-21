drop function public.move_task(uuid, uuid);

create function public.move_task(
  target_task_id uuid,
  target_column_id uuid,
  previous_task_id uuid default null,
  next_task_id uuid default null
)
returns table (new_column_id uuid, new_position bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  task_record public.tasks%rowtype;
  previous_position bigint;
  next_position bigint;
  calculated_position bigint;
  maximum_position bigint;
  active_task_count bigint;
  normalization_offset bigint;
  needs_normalization boolean := false;
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
    and project.archived_at is null
  for update of task;

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

  perform 1
  from public.board_columns as board_column
  where board_column.id = target_column_id
    and board_column.workspace_id = task_record.workspace_id
    and board_column.project_id = task_record.project_id
  for update;

  if not found then
    raise exception 'Target column must belong to the task project'
      using errcode = '22023';
  end if;

  if previous_task_id = target_task_id or next_task_id = target_task_id then
    raise exception 'A task cannot be its own ordering neighbor'
      using errcode = '22023';
  end if;

  if previous_task_id is not null and previous_task_id = next_task_id then
    raise exception 'Ordering neighbors must be distinct'
      using errcode = '22023';
  end if;

  perform 1
  from public.tasks as task
  where task.column_id = target_column_id
    and task.archived_at is null
  order by task.position, task.id
  for update;

  if previous_task_id is not null then
    select task.position
    into previous_position
    from public.tasks as task
    where task.id = previous_task_id
      and task.workspace_id = task_record.workspace_id
      and task.project_id = task_record.project_id
      and task.column_id = target_column_id
      and task.archived_at is null;

    if previous_position is null then
      raise exception 'Previous task must be active in the target column'
        using errcode = '22023';
    end if;
  end if;

  if next_task_id is not null then
    select task.position
    into next_position
    from public.tasks as task
    where task.id = next_task_id
      and task.workspace_id = task_record.workspace_id
      and task.project_id = task_record.project_id
      and task.column_id = target_column_id
      and task.archived_at is null;

    if next_position is null then
      raise exception 'Next task must be active in the target column'
        using errcode = '22023';
    end if;
  end if;

  if previous_task_id is null and next_task_id is not null and exists (
    select 1
    from public.tasks as task
    where task.column_id = target_column_id
      and task.id <> target_task_id
      and task.archived_at is null
      and task.position < next_position
  ) then
    raise exception 'Next task must be the first ordering neighbor'
      using errcode = '22023';
  end if;

  if previous_task_id is not null and next_task_id is null and exists (
    select 1
    from public.tasks as task
    where task.column_id = target_column_id
      and task.id <> target_task_id
      and task.archived_at is null
      and task.position > previous_position
  ) then
    raise exception 'Previous task must be the last ordering neighbor'
      using errcode = '22023';
  end if;

  if previous_task_id is not null and next_task_id is not null then
    if previous_position >= next_position or exists (
      select 1
      from public.tasks as task
      where task.column_id = target_column_id
        and task.id <> target_task_id
        and task.archived_at is null
        and task.position > previous_position
        and task.position < next_position
    ) then
      raise exception 'Ordering neighbors must be adjacent and ordered'
        using errcode = '22023';
    end if;
  end if;

  if previous_task_id is null and next_task_id is null then
    select coalesce(max(task.position), 0) + 1024
    into calculated_position
    from public.tasks as task
    where task.column_id = target_column_id
      and task.id <> target_task_id
      and task.archived_at is null;
  elsif previous_task_id is null then
    needs_normalization := next_position <= 1;
    if not needs_normalization then
      calculated_position := next_position / 2;
    end if;
  elsif next_task_id is null then
    calculated_position := previous_position + 1024;
  else
    needs_normalization := next_position - previous_position <= 1;
    if not needs_normalization then
      calculated_position := previous_position
        + ((next_position - previous_position) / 2);
    end if;
  end if;

  if needs_normalization then
    select coalesce(max(task.position), 0), count(*)
    into maximum_position, active_task_count
    from public.tasks as task
    where task.column_id = target_column_id
      and task.archived_at is null;

    normalization_offset := maximum_position
      + ((active_task_count + 1) * 1024);

    update public.tasks
    set position = position + normalization_offset
    where column_id = target_column_id
      and archived_at is null;

    with ordered_tasks as (
      select
        task.id,
        row_number() over (order by task.position, task.id) * 1024
          as normalized_position
      from public.tasks as task
      where task.column_id = target_column_id
        and task.archived_at is null
    )
    update public.tasks as task
    set position = ordered_task.normalized_position
    from ordered_tasks as ordered_task
    where task.id = ordered_task.id;

    if previous_task_id is not null then
      select task.position
      into previous_position
      from public.tasks as task
      where task.id = previous_task_id;
    end if;

    if next_task_id is not null then
      select task.position
      into next_position
      from public.tasks as task
      where task.id = next_task_id;
    end if;

    if previous_task_id is null then
      calculated_position := next_position / 2;
    else
      calculated_position := previous_position
        + ((next_position - previous_position) / 2);
    end if;
  end if;

  update public.tasks
  set column_id = target_column_id,
      position = calculated_position
  where id = task_record.id;

  return query select target_column_id, calculated_position;
end;
$$;

revoke all on function public.move_task(uuid, uuid, uuid, uuid) from public;
grant execute on function public.move_task(uuid, uuid, uuid, uuid)
  to authenticated, service_role;

alter table public.tasks replica identity full;
alter publication supabase_realtime add table public.tasks;
