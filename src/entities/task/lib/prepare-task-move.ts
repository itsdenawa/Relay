import type { Task } from "../model/types";

export type PreparedTaskMove = {
  taskId: string;
  targetColumnId: string;
  targetIndex: number;
  previousTaskId: string | null;
  nextTaskId: string | null;
  tasks: Task[];
};

function tasksInColumn(tasks: Task[], columnId: string, excludedId?: string) {
  return tasks
    .filter((task) => task.column_id === columnId && task.id !== excludedId)
    .sort((first, second) => first.position - second.position);
}

export function prepareTaskMove(
  tasks: Task[],
  taskId: string,
  targetColumnId: string,
  targetIndex: number,
): PreparedTaskMove | null {
  const activeTask = tasks.find((task) => task.id === taskId);
  if (!activeTask) return null;

  const destinationTasks = tasksInColumn(tasks, targetColumnId, taskId);
  const boundedIndex = Math.max(
    0,
    Math.min(targetIndex, destinationTasks.length),
  );
  const movedTask = { ...activeTask, column_id: targetColumnId };
  destinationTasks.splice(boundedIndex, 0, movedTask);

  const positions = new Map(
    destinationTasks.map((task, index) => [task.id, (index + 1) * 1024]),
  );

  if (activeTask.column_id !== targetColumnId) {
    tasksInColumn(tasks, activeTask.column_id, taskId).forEach(
      (task, index) => {
        positions.set(task.id, (index + 1) * 1024);
      },
    );
  }

  return {
    taskId,
    targetColumnId,
    targetIndex: boundedIndex,
    previousTaskId: destinationTasks[boundedIndex - 1]?.id ?? null,
    nextTaskId: destinationTasks[boundedIndex + 1]?.id ?? null,
    tasks: tasks.map((task) => {
      const position = positions.get(task.id);
      if (task.id === taskId) {
        return {
          ...task,
          column_id: targetColumnId,
          position: position ?? task.position,
        };
      }
      return position === undefined ? task : { ...task, position };
    }),
  };
}
