import type { CalendarEvent, ResearchPaper, Task, TaskGroup } from "./types";
import { defaultGroupColor, normalizeGroupColor } from "./utils/groupColors";

export type AppData = {
  tasks: Task[];
  taskGroups: TaskGroup[];
  events: CalendarEvent[];
  researchPapers: ResearchPaper[];
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

type ApiTaskGroup = {
  task_group_id: number;
  name: string;
  description: string | null;
  icon_placeholder?: string | null;
  color?: string | null;
  created_at: string;
  updated_at: string;
};

type ApiTask = {
  task_id: number;
  name: string;
  description: string | null;
  completed_at: string | null;
  completed: boolean;
  priority: number | null;
  due_datetime: string | null;
  task_group_id: number | null;
  created_at: string;
  updated_at: string;
};

type ApiEvent = {
  event_id: number;
  name: string;
  description: string | null;
  task_group_id: number | null;
  start_datetime: string;
  finish_datetime: string;
  created_at: string;
};

export async function loadRemoteData(): Promise<AppData> {
  const [tasks, taskGroups, events] = await Promise.all([getTasks(), getTaskGroups(), getEvents()]);

  return {
    tasks,
    taskGroups,
    events,
    researchPapers: [],
  };
}

export async function getTasks(): Promise<Task[]> {
  const tasks = await apiRequest<ApiTask[]>("/api/tasks/");
  return tasks.map(fromApiTask);
}

export async function createRemoteTask(task: Pick<Task, "name" | "description" | "taskGroupId" | "dueDate" | "priority">): Promise<Task> {
  const createdTask = await apiRequest<ApiTask>("/api/tasks/", {
    method: "POST",
    body: JSON.stringify({
      name: task.name,
      description: task.description,
      priority: task.priority,
      due_datetime: task.dueDate || null,
      task_group_id: toOptionalNumber(task.taskGroupId),
    }),
  });

  return fromApiTask(createdTask);
}

export async function updateRemoteTask(taskId: string, task: Partial<Task>): Promise<Task> {
  const payload: Record<string, string | number | boolean | null | undefined> = {};

  if ("name" in task) {
    payload.name = task.name;
  }

  if ("description" in task) {
    payload.description = task.description;
  }

  if ("completed" in task) {
    payload.completed = task.completed;
  }

  if ("completedAt" in task) {
    payload.completed_at = task.completedAt ?? null;
  }

  if ("priority" in task) {
    payload.priority = task.priority;
  }

  if ("dueDate" in task) {
    payload.due_datetime = task.dueDate || null;
  }

  if ("taskGroupId" in task) {
    payload.task_group_id = toOptionalNumber(task.taskGroupId);
  }

  const updatedTask = await apiRequest<ApiTask>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return fromApiTask(updatedTask);
}

export async function deleteRemoteTask(taskId: string) {
  await apiRequest(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function getTaskGroups(): Promise<TaskGroup[]> {
  const groups = await apiRequest<ApiTaskGroup[]>("/api/task_groups/");
  return groups.map((group) => fromApiTaskGroup(group));
}

export async function createRemoteTaskGroup(name: string, iconPlaceholder: string, color: string): Promise<TaskGroup> {
  const group = await apiRequest<ApiTaskGroup>("/api/task_groups/", {
    method: "POST",
    body: JSON.stringify({
      name,
      description: "",
      icon_placeholder: iconPlaceholder,
      color: normalizeGroupColor(color),
    }),
  });

  return fromApiTaskGroup(group, iconPlaceholder, color);
}

export async function updateRemoteTaskGroup(groupId: string, name: string, iconPlaceholder: string, color: string): Promise<TaskGroup> {
  const group = await apiRequest<ApiTaskGroup>(`/api/task_groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      icon_placeholder: iconPlaceholder,
      color: normalizeGroupColor(color),
    }),
  });

  return fromApiTaskGroup(group, iconPlaceholder, color);
}

export async function deleteRemoteTaskGroup(groupId: string) {
  await apiRequest(`/api/task_groups/${groupId}`, {
    method: "DELETE",
  });
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const events = await apiRequest<ApiEvent[]>("/api/events/");
  return events.map(fromApiEvent);
}

export async function createRemoteEvent(event: Pick<CalendarEvent, "name" | "description" | "taskGroupId" | "date" | "startTime" | "endTime">): Promise<CalendarEvent> {
  const createdEvent = await apiRequest<ApiEvent>("/api/events/", {
    method: "POST",
    body: JSON.stringify(toApiEventPayload(event)),
  });

  return fromApiEvent(createdEvent);
}

export async function updateRemoteEvent(eventId: string, event: Pick<CalendarEvent, "name" | "description" | "taskGroupId" | "date" | "startTime" | "endTime">): Promise<CalendarEvent> {
  const updatedEvent = await apiRequest<ApiEvent>(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(toApiEventPayload(event)),
  });

  return fromApiEvent(updatedEvent);
}

export async function deleteRemoteEvent(eventId: string) {
  await apiRequest(`/api/events/${eventId}`, {
    method: "DELETE",
  });
}

async function apiRequest<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function fromApiTask(task: ApiTask): Task {
  return {
    id: String(task.task_id),
    name: task.name,
    description: task.description ?? "",
    taskGroupId: task.task_group_id === null ? undefined : String(task.task_group_id),
    dueDate: task.due_datetime ?? undefined,
    priority: task.priority ?? undefined,
    completed: task.completed,
    completedAt: task.completed_at ?? undefined,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

function fromApiTaskGroup(
  group: ApiTaskGroup,
  iconPlaceholder = "inbox",
  color = defaultGroupColor,
): TaskGroup {
  const id = String(group.task_group_id);

  return {
    id,
    name: group.name,
    iconPlaceholder: group.icon_placeholder ?? iconPlaceholder,
    color: normalizeGroupColor(group.color ?? color),
    createdAt: group.created_at,
  };
}

function fromApiEvent(event: ApiEvent): CalendarEvent {
  return {
    id: String(event.event_id),
    name: event.name,
    description: event.description ?? "",
    taskGroupId: event.task_group_id === null ? undefined : String(event.task_group_id),
    date: event.start_datetime.slice(0, 10),
    startTime: event.start_datetime.slice(11, 16),
    endTime: event.finish_datetime.slice(11, 16),
    createdAt: event.created_at,
    updatedAt: event.created_at,
  };
}

function toApiEventPayload(event: Pick<CalendarEvent, "name" | "description" | "taskGroupId" | "date" | "startTime" | "endTime">) {
  return {
    name: event.name,
    description: event.description,
    task_group_id: toOptionalNumber(event.taskGroupId),
    start_datetime: `${event.date}T${event.startTime}:00`,
    finish_datetime: `${event.date}T${event.endTime}:00`,
  };
}

function toOptionalNumber(value?: string) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
