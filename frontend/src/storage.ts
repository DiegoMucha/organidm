import type { CalendarEvent, ResearchPaper, Task, TaskGroup } from "./types";

const TASKS_KEY = "personal-manager.tasks";
const TASK_GROUPS_KEY = "personal-manager.task-groups";
const EVENTS_KEY = "personal-manager.events";
const RESEARCH_PAPERS_KEY = "personal-manager.research-papers";

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

export function defaultTaskGroups(): TaskGroup[] {
  return [
    {
      id: "group-inbox",
      name: "Inbox",
      iconPlaceholder: "inbox",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function loadLocalData(): AppData {
  return {
    tasks: loadTasks(),
    taskGroups: loadTaskGroups(),
    events: loadEvents(),
    researchPapers: loadResearchPapers(),
  };
}

export function saveLocalData(data: AppData) {
  saveTasks(data.tasks);
  saveTaskGroups(data.taskGroups);
  saveEvents(data.events);
  saveResearchPapers(data.researchPapers);
}

export async function loadRemoteData(): Promise<AppData> {
  const localData = loadLocalData();
  const [tasks, taskGroups, events] = await Promise.all([getTasks(), getTaskGroups(localData.taskGroups), getEvents()]);

  return {
    tasks,
    taskGroups: taskGroups.length ? taskGroups : defaultTaskGroups(),
    events,
    researchPapers: localData.researchPapers,
  };
}

export async function saveRemoteData(data: AppData): Promise<AppData> {
  return data;
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

export async function getTaskGroups(localGroups: TaskGroup[] = []): Promise<TaskGroup[]> {
  const groups = await apiRequest<ApiTaskGroup[]>("/api/task_groups/");
  return groups.map((group) => fromApiTaskGroup(group, localGroups));
}

export async function createRemoteTaskGroup(name: string, iconPlaceholder: string): Promise<TaskGroup> {
  const group = await apiRequest<ApiTaskGroup>("/api/task_groups/", {
    method: "POST",
    body: JSON.stringify({
      name,
      description: null,
    }),
  });

  return fromApiTaskGroup(group, [], iconPlaceholder);
}

export async function updateRemoteTaskGroup(groupId: string, name: string, iconPlaceholder: string): Promise<TaskGroup> {
  const group = await apiRequest<ApiTaskGroup>(`/api/task_groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
    }),
  });

  return fromApiTaskGroup(group, [], iconPlaceholder);
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

export function hasUserData(data: AppData) {
  return (
    data.tasks.length > 0 ||
    data.events.length > 0 ||
    data.researchPapers.length > 0 ||
    data.taskGroups.some((group) => group.id !== "group-inbox")
  );
}

export function loadTasks(): Task[] {
  return loadFromStorage<Task[]>(TASKS_KEY, []);
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadTaskGroups(): TaskGroup[] {
  return loadFromStorage<TaskGroup[]>(TASK_GROUPS_KEY, defaultTaskGroups());
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

export function loadResearchPapers(): ResearchPaper[] {
  return loadFromStorage<ResearchPaper[]>(RESEARCH_PAPERS_KEY, []);
}

export function saveResearchPapers(papers: ResearchPaper[]) {
  localStorage.setItem(RESEARCH_PAPERS_KEY, JSON.stringify(papers));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
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

function fromApiTaskGroup(group: ApiTaskGroup, localGroups: TaskGroup[] = [], iconPlaceholder = "inbox"): TaskGroup {
  const id = String(group.task_group_id);
  const localGroup = localGroups.find((currentGroup) => currentGroup.id === id);

  return {
    id,
    name: group.name,
    iconPlaceholder: localGroup?.iconPlaceholder ?? iconPlaceholder,
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
