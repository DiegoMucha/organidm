export type TaskGroup = {
  id: string;
  name: string;
  iconPlaceholder: string;
  color?: string;
  createdAt: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  taskGroupId?: string;
  dueDate?: string;
  priority?: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEvent = {
  id: string;
  name: string;
  description: string;
  taskGroupId?: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

export type ResearchPaper = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  abstract: string;
  paperUrl: string;
  reviewUrl: string;
  implementationUrl: string;
  trainingRepoUrl: string;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
};

export type DateFilter = "all" | "today" | "tomorrow" | "custom";
