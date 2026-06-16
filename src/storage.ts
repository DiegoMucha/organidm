import type { CalendarEvent, Task, TaskGroup } from "./types";

const TASKS_KEY = "personal-manager.tasks";
const TASK_GROUPS_KEY = "personal-manager.task-groups";
const EVENTS_KEY = "personal-manager.events";

export function loadTasks(): Task[] {
  return loadFromStorage<Task[]>(TASKS_KEY, []);
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadTaskGroups(): TaskGroup[] {
  return loadFromStorage<TaskGroup[]>(TASK_GROUPS_KEY, [
    {
      id: "group-inbox",
      name: "Inbox",
      iconPlaceholder: "inbox",
      createdAt: new Date().toISOString(),
    },
  ]);
}

export function saveTaskGroups(groups: TaskGroup[]) {
  localStorage.setItem(TASK_GROUPS_KEY, JSON.stringify(groups));
}

export function loadEvents(): CalendarEvent[] {
  return loadFromStorage<CalendarEvent[]>(EVENTS_KEY, []);
}

export function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}
