/**
 * Goal task domain utilities.
 *
 * The catalogue may keep its compact `string[]` task definitions, while the
 * running application always consumes stable task objects.  Stable ids make a
 * completion usable by future systems (rewards, stats, room changes, etc.).
 */
export const normalizeTaskPlan = (taskPlan = []) => taskPlan.map((day, dayIndex) => ({
  id: day.id ?? `day-${dayIndex + 1}`,
  dayNumber: day.dayNumber ?? dayIndex + 1,
  title: day.title ?? `Day ${dayIndex + 1}`,
  tasks: (day.tasks ?? []).map((task, taskIndex) => (
    typeof task === 'string'
      ? { id: `day-${dayIndex + 1}-task-${taskIndex + 1}`, title: task }
      : {
          ...task,
          id: task.id ?? `day-${dayIndex + 1}-task-${taskIndex + 1}`,
          title: task.title ?? task.name ?? '',
        }
  )),
}));

export const findTask = (taskPlan, taskId) =>
  taskPlan.flatMap((day) => day.tasks.map((task) => ({ ...task, dayNumber: day.dayNumber })))
    .find((task) => task.id === taskId) ?? null;

const legacyTaskId = (taskPlan, completion, usedTaskIds) => {
  const day = taskPlan.find((item) => item.dayNumber === completion.day);
  return day?.tasks.find((task) => task.title === completion.task && !usedTaskIds.has(task.id))?.id ?? null;
};

/** Converts legacy completion records without ids while retaining all history. */
export const normalizeCompletedTasks = (taskPlan, completedTasks = []) => {
  const usedTaskIds = new Set();
  return completedTasks.map((completion) => {
    const taskId = completion.taskId ?? legacyTaskId(taskPlan, completion, usedTaskIds);
    if (taskId) usedTaskIds.add(taskId);
    return { ...completion, taskId };
  });
};

export const getCompletedTaskIds = (goal, taskPlan) => new Set(
  normalizeCompletedTasks(taskPlan, goal?.completedTasks).map((task) => task.taskId).filter(Boolean),
);

/**
 * Completes exactly one task and returns a domain event for future consumers.
 * No game-side effects belong here; callers can later react to `event`.
 */
export const completeTaskInGoal = (goal, taskPlan, taskId, note = '', completedAt = new Date().toISOString()) => {
  if (!goal) return { goal, event: null };

  const task = findTask(taskPlan, taskId);
  const completedTasks = normalizeCompletedTasks(taskPlan, goal.completedTasks);
  if (!task || completedTasks.some((item) => item.taskId === taskId)) return { goal, event: null };

  const completion = {
    id: `${taskId}-${Date.now()}`,
    taskId,
    day: task.dayNumber,
    task: task.title,
    note: note.trim(),
    completedAt,
  };
  const nextGoal = { ...goal, taskPlan, completedTasks: [...completedTasks, completion] };
  return {
    goal: nextGoal,
    event: { type: 'task.completed', task, completion, goalId: goal.id },
  };
};
